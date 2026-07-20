package com.teachhire.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;

public record UpdateTeacherProfileRequest(

        @NotBlank
        String fullName,

        String headline,

        String bio,

        String avatarUrl,

        @PositiveOrZero
        Integer yearsExperience,

        @NotNull
        List<Long> subjectIds
) {
}
