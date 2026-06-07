package com.backend.backend.service;

import com.backend.backend.dao.UserRepository;
import com.backend.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    public User processOAuth2User(OAuth2User oAuth2User, String provider) {
        String email = oAuth2User.getAttribute("email");
        String id;

        // Google uses "sub", Facebook uses "id"
        if ("google".equals(provider)) {
            id = oAuth2User.getAttribute("sub");
        } else {
            id = oAuth2User.getAttribute("id");
        }

        String username = email != null ? email : provider + "_" + id;

        System.out.println("Provider: " + provider);
        System.out.println("Email: " + email);
        System.out.println("ID: " + id);
        System.out.println("Username: " + username);

        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) return existing.get();

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setProvider(provider);
        user.setProviderId(id);
        user.setPassword("{noop}oauth2_no_password");

        return userRepository.save(user);
    }
}