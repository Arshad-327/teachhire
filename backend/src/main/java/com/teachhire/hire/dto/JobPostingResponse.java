package com.teachhire.hire.dto;

import com.teachhire.hire.JobStatus;

import java.time.Instant;

public record JobPostingResponse(
        Long id,
        Long institutionId,
        String institutionName,
        String title,
        String description,
        Long subjectId,
        String subjectName,
        String salaryRange,
        JobStatus status,
        Instant postedAt
) {
}
