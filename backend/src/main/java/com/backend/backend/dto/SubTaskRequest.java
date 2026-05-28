package com.backend.backend.dto;

import lombok.Data;

@Data
public class SubTaskRequest {
    private Long id;
    private String title;
    private boolean completed;
}
