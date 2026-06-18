package com.backend.backend.controller;

import com.backend.backend.config.CookieUtil;
import com.backend.backend.dto.RegisterRequest;
import com.backend.backend.dto.UserResponse;
import com.backend.backend.entity.User;
import com.backend.backend.service.JwtService;
import com.backend.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
//@CrossOrigin("http://localhost:4200")
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
        User user = new User();

        user.setUsername(request.getUsername());
//        user.setPassword(encoder.encode(request.getPassword()));
        user.setPassword(request.getPassword());

        User saved = service.saveUser(user);
        UserResponse response = new UserResponse(saved.getId(), saved.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(
                            user.getUsername(), user.getPassword()
                    ));
            if (authentication.isAuthenticated()) {
                String jwt = jwtService.generateToken(user.getUsername());
                ResponseCookie cookie = CookieUtil.buildTokenCookie(jwt);

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .body(Map.of("username", user.getUsername()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Login failed"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/auth/me")
    public ResponseEntity<?> me(Authentication authentication) {
        // JwtFilter already authenticated via the cookie; if it didn't,
        // Spring Security returns 401 before reaching here
        return ResponseEntity.ok(Map.of("username", authentication.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, CookieUtil.buildClearCookie().toString())
                .body(Map.of("message", "Logged out"));
    }
}
