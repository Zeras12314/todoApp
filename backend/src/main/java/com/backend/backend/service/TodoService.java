package com.backend.backend.service;

import com.backend.backend.dao.TodoRepository;
import com.backend.backend.dao.UserRepository;
import com.backend.backend.dto.TodoRequest;
import com.backend.backend.entity.Todo;
import com.backend.backend.entity.User;
import com.backend.backend.enums.Priority;
import com.backend.backend.enums.Status;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    public Todo createTodo(TodoRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (request.getDueDate() != null && request.getDueDate().before(new Date())) {
            throw new IllegalArgumentException("Due date cannot be in the past");
        }

        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setPriority(Priority.valueOf(request.getPriority()));
        todo.setStatus(Status.NOT_STARTED);
        todo.setDueDate(request.getDueDate());
        todo.setDescription(request.getDescription());
        todo.setUser(user);

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
            if (request.getDueDate().before(new Date()))
                throw new IllegalArgumentException("Due date cannot be in the past");
            existing.setDueDate(request.getDueDate());
        }

        if (request.getDescription() != null)
            existing.setDescription(request.getDescription());

        return todoRepository.save(existing);
    }

    @Transactional
    public String deleteTodos(List<Long> ids, String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        todoRepository.deleteByIdInAndUserId(ids, user.getId());
        return "Deleted " + ids.size() + " todo(s) successfully";
    }

}
