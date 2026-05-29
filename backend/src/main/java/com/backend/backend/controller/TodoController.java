package com.backend.backend.controller;

import com.backend.backend.dao.TodoRepository;
import com.backend.backend.dto.TodoRequest;
import com.backend.backend.entity.Todo;
import com.backend.backend.entity.TodoAttachment;
import com.backend.backend.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api")
public class TodoController {

    @Autowired
    private TodoService todoService;

    @Autowired
    private TodoRepository todoRepository;

    // CREATE TODO
    @PostMapping("/todos")
    public ResponseEntity<?> createTodo(
            @Valid @RequestBody TodoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Todo saved = todoService.createTodo(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET ALL TODOS
    @GetMapping("/todos")
    public ResponseEntity<List<Todo>> getMyTodos(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                todoService.getTodoByUsername(userDetails.getUsername()));
    }

    // GET TODO BY ID
    @GetMapping("/todos/{id}")
    public ResponseEntity<?> getTodoById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        String username = userDetails.getUsername();
        Todo todo = todoService.getTodoByIdAndUsername(id, username);

        if (todo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Task with id " + id + " does not exist"));
        }

        return ResponseEntity.ok(todo);
    }

    // UPDATE TODO
    @PutMapping("/todos/{id}")
    public ResponseEntity<?> updateTodo(
            @PathVariable Long id,
            @Valid @RequestBody TodoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Todo saved = todoService.updateTodo(id, request, userDetails.getUsername());
        return ResponseEntity.ok(saved);
    }

    // DELETE TODO
    @DeleteMapping("/todos")
    public ResponseEntity<?> deleteTodos(
            @RequestBody List<Long> ids,
            @AuthenticationPrincipal UserDetails userDetails) {

        String message = todoService.deleteTodos(ids, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", message));
    }

    // TODO ATTACHEMENT
    @PostMapping(value = "/todos/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
            ){

        TodoAttachment attachment = todoService.addAttachment(id, file, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);

    }

    @DeleteMapping("todos/{todoId}/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(
            @PathVariable Long todoId,
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal UserDetails userDetails){

        todoService.deleteAttachment(todoId, attachmentId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message","Attachment Deleted"));
    }
}
