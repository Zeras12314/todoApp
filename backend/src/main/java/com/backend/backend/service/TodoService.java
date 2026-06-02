package com.backend.backend.service;

import com.backend.backend.dao.TodoAttachmentRepository;
import com.backend.backend.dao.TodoRepository;
import com.backend.backend.dao.UserRepository;
import com.backend.backend.dto.TodoRequest;
import com.backend.backend.entity.SubTask;
import com.backend.backend.entity.Todo;
import com.backend.backend.entity.TodoAttachment;
import com.backend.backend.entity.User;
import com.backend.backend.enums.Priority;
import com.backend.backend.enums.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private TodoAttachmentRepository attachmentRepository;

    public Todo createTodo(TodoRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        if (request.getDueDate() != null &&
                request.getDueDate().before(startOfToday())) {

            throw new IllegalArgumentException("Due date cannot be in the past");
        }

        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setPriority(Priority.valueOf(request.getPriority()));
        todo.setStatus(Status.NOT_STARTED);
        todo.setDueDate(request.getDueDate());
        todo.setDescription(request.getDescription());
        todo.setUser(user);

        if (request.getSubTasks() != null) {
            List<SubTask> subTasks = request.getSubTasks().stream().map(s -> {
                SubTask st = new SubTask();
                st.setTitle(s.getTitle());
                st.setCompleted(s.isCompleted());
                st.setTodo(todo);
                return st;
            }).collect(Collectors.toList());
            todo.setSubTasks(subTasks);
        }

        return todoRepository.save(todo);
    }

    public List<Todo> getTodoByUsername(String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return todoRepository.findByUserId(user.getId());
    }

    public Todo getTodoByIdAndUsername(Long id, String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));
        return todoRepository.findByIdAndUserId(id, user.getId()).orElse(null);
    }

    private Date startOfToday() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    @Transactional
    public Todo updateTodo(Long id, TodoRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Todo existing = todoRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Todo not found or unauthorized"));

        if (request.getStatus() != null) {
            Status newStatus = Status.valueOf(request.getStatus());
            existing.setStatus(newStatus);

            if (newStatus == Status.COMPLETED) {
                // Use provided completedDate or default to now
                existing.setCompletedDate(
                        request.getCompletedDate() != null ? request.getCompletedDate() : new Date()
                );
            } else {
                // Always clear completedDate if status is not COMPLETED
                existing.setCompletedDate(null);
            }
        }

        if (request.getDueDate() != null) {
            if (request.getDueDate().before(startOfToday()))
                throw new IllegalArgumentException("Due date cannot be in the past");
            existing.setDueDate(request.getDueDate());
        }

        if (request.getDescription() != null)
            existing.setDescription(request.getDescription());

        if (request.getSubTasks() != null) {
            existing.getSubTasks().clear();  // orphanRemoval handles DB deletion
            request.getSubTasks().forEach(s -> {
                SubTask st = new SubTask();
                st.setTitle(s.getTitle());
                st.setCompleted(s.isCompleted());
                st.setTodo(existing);
                existing.getSubTasks().add(st);
            });
        }
        return todoRepository.save(existing);
    }

    @Transactional
    public String deleteTodos(List<Long> ids, String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        todoRepository.deleteByIdInAndUserId(ids, user.getId());
        return "Deleted " + ids.size() + " todo(s) successfully";
    }


    // ATTACHMENTS
    public TodoAttachment addAttachment(Long todoId, MultipartFile file, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Todo todo = todoRepository.findByIdAndUserId(todoId, user.getId())
                .orElseThrow(() -> new RuntimeException("Todo not found or unauthorized"));

        try {
            String filePath = fileStorageService.saveFile(file);

            TodoAttachment attachment = new TodoAttachment();
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileType(file.getContentType());
            attachment.setFilePath(filePath);
            attachment.setFileSize(file.getSize());
            attachment.setTodo(todo);

            return attachmentRepository.save(attachment);
        } catch (IOException e){
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }

    }

    @Transactional
    public void deleteAttachment(Long todoId, Long attachmentId, String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        todoRepository.findByIdAndUserId(todoId, user.getId())
                .orElseThrow(() -> new RuntimeException("Todo not found or unauthorized"));

        TodoAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        try {
            fileStorageService.deleteFile(attachment.getFilePath());
            attachmentRepository.delete(attachment);
        }
        catch(IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }

    }
}
