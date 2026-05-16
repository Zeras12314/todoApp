package com.backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^[A-Za-z0-9 !#()_\\-]+$",
            message = "Password contains invalid characters"
    )
    private String password;
}