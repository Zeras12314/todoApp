package com.backend.backend.service;

import com.backend.backend.dao.UserRepository;
import com.backend.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private final UserRepository userRepo;

    private final PasswordEncoder passwordEncoder;


    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public User saveUser(User user){
        if (userRepo.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        String username = user.getUsername().toLowerCase();
        String rawPassword = user.getPassword(); // ✅ RAW password

        System.out.println(username);
        System.out.println(rawPassword);

        if (rawPassword != null &&
                rawPassword.toLowerCase().contains(username)) {

            throw new IllegalArgumentException("Password cannot contain your username");
        }

        // ✅ NOW encode AFTER validation
        user.setPassword(passwordEncoder.encode(rawPassword));


        return userRepo.save(user);
    }


}
