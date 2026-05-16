package com.backend.backend.service;

import com.backend.backend.dao.UserRepository;
import com.backend.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    public User saveUser(User user){
        if (userRepo.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        return userRepo.save(user);
    }


}
