package com.teachhire.hire.dto;

import com.teachhire.hire.ApplicationStatus;

import java.time.Instant;

public record JobApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String institutionName,
        Long teacherId,
        String teacherName,
        ApplicationStatus status,
        Instant appliedAt
) {
}
