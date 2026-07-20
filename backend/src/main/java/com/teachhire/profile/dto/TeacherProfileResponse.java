package com.teachhire.profile.dto;

import java.util.List;

public record TeacherProfileResponse(
        Long id,
        String fullName,
        String headline,
        String bio,
        String avatarUrl,
        Integer yearsExperience,
        Double ratingAvg,
        Integer ratingCount,
        List<SubjectSummary> subjects
) {
}
