package com.backend.backend.dao;

import com.backend.backend.entity.TodoAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoAttachmentRepository extends JpaRepository<TodoAttachment, Long> {
    List<TodoAttachment> findByTodoId(Long todoId);
}
