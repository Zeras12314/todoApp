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
            regexp = "^(?=.*[0-9!#()_\\-])[A-Za-z0-9 !#()_\\-]+$",
            message = "Password must contain at least one number or symbol (!#()_-) and may only include letters, numbers, spaces, and !#()_-"
    )
    private String password;
}