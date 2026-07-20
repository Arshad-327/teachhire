package com.teachhire.learn.dto;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long courseId,
        Long studentId,
        String studentName,
        Integer rating,
        String comment,
        Instant createdAt
) {
}
