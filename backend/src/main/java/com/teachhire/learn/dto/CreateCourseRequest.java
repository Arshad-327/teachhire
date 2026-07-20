package com.teachhire.learn.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateCourseRequest(

        @NotBlank
        String title,

        @NotBlank
        String description,

        @NotNull
        Long subjectId,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = true)
        BigDecimal price,

        String thumbnailUrl
) {
}
