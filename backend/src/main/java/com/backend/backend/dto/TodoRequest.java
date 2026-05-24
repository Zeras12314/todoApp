package com.backend.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Date;

@Data
public class TodoRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 25, message = "Title cannot exceed 25 characters")
    private String title;

    @Size(max = 300, message = "Title cannot exceed 300 characters")
    private String description;

    private Date dueDate;

    private String priority;

    private String status;

    private Date completedDate;
}
