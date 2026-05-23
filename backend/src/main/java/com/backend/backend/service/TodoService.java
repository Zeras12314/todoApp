package com.backend.backend.service;

import com.backend.backend.dao.TodoRepository;
import com.backend.backend.dao.UserRepository;
import com.backend.backend.entity.Todo;
import com.backend.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    public Todo createTodo(
            Todo todo,
            String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(()-> new UsernameNotFoundException("User not found"));
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

//    public Todo updateTodo(Long id, Todo updated, String username){
//        Todo existing = todoRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Todo not found"));
//
//        if(!existing.getUser().getUsername().equals(username)){
//            throw new RuntimeException("Unauthorized");
//
//            existing.setDetails(updated.getDetails());
//
//        }
//    }
}
