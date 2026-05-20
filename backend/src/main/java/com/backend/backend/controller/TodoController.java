package com.backend.backend.controller;

import com.backend.backend.dao.TodoRepository;
import com.backend.backend.dao.UserRepository;
import com.backend.backend.entity.Todo;
import com.backend.backend.entity.User;
import com.backend.backend.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api")
public class TodoController {

    @Autowired
    private TodoService todoService;

    @Autowired
    private TodoRepository todoRepository;

    @PostMapping("/todos") // ✅ THIS WAS MISSING
    public ResponseEntity<?> createTodo(
            @RequestBody Todo todo,
            @AuthenticationPrincipal UserDetails userDetails)
    {
        Todo saved = todoService.createTodo(todo, userDetails.getUsername());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @GetMapping("/todos")
    public ResponseEntity<List<Todo>> getMyTodos(
            @AuthenticationPrincipal UserDetails userDetails){
        return ResponseEntity.ok(
                todoService.getTodoByUsername(userDetails.getUsername()));
    }

}
