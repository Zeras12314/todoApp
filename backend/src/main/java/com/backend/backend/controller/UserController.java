package com.backend.backend.controller;

import com.backend.backend.entity.User;
import com.backend.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    private UserService service;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @PostMapping("register")
    public User register(@RequestBody User user){
        user.setPassword(encoder.encode(user.getPassword()));
        System.out.println(user.getPassword());
        return service.saveUser(user);
    }
}
