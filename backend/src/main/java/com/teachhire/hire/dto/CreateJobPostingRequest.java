package com.teachhire.hire.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateJobPostingRequest(

        @NotBlank
        String title,

        @NotBlank
        String description,

        @NotNull
        Long subjectId,

        String salaryRange
) {
}
