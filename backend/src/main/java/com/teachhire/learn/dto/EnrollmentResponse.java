package com.teachhire.learn.dto;

import com.teachhire.learn.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record EnrollmentResponse(
        Long id,
        Long courseId,
        String courseTitle,
        String teacherName,
        BigDecimal price,
        PaymentStatus paymentStatus,
        Instant enrolledAt
) {
}
