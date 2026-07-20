package com.teachhire.learn.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CourseDetailResponse(
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
        Instant createdAt,
        List<CourseContentResponse> contents
) {
}
