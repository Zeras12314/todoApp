package com.backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Pattern(
            regexp = "^[A-Za-z0-9 !#()_\\-]+$",
            message = "Only letters, numbers, spaces, and the symbols !#()_- are allowed"
    )
    private String username;

    @NotBlank(message = "Password is required")
    @Size(
            min = 8,
            message = "Password must be at least 8 characters long"
    )
    @Pattern(
            regexp = "^(?=.*[0-9!#()_\\-])[A-Za-z0-9 !#()_\\-]+$",
            message = "Password must include at least one number or symbol (!#()_-) and may only contain letters, numbers, spaces, and !#()_-"
    )
    private String password;
}