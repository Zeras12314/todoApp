package com.backend.backend.entity;

import com.backend.backend.enums.Priority;
import com.backend.backend.enums.Status;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name="todo")
public class Todo {
    @Id
    @GeneratedValue(strategy  = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Date dueDate;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore   // ✅ ADD THIS
    private User user;
}
