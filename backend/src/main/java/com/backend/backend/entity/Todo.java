package com.backend.backend.entity;

import com.backend.backend.enums.Priority;
import com.backend.backend.enums.Status;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name="todo")
public class Todo {
    @Id
    @GeneratedValue(strategy  = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @CreationTimestamp
    @Column(updatable = false)
    private Date createdDate;

    private Date dueDate;

    private Date completedDate;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToMany(
            mappedBy = "todo",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SubTask> subTasks;

}
