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
        return userRepo.save(user);
    }
}
