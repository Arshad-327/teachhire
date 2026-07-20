package com.teachhire.learn.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CourseResponse(
        Long id,
        Long teacherId,
        String teacherName,
        String title,
        String description,
        Long subjectId,
        String subjectName,
        BigDecimal price,
        String thumbnailUrl,
        boolean published,
        Instant createdAt
) {
}
