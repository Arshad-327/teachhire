package com.teachhire.profile.aggregate.dto;

import java.util.List;

public record TeacherProfileAggregateResponse(
        Long id,
        String fullName,
        String headline,
        String bio,
        String avatarUrl,
        Integer yearsExperience,
        Double ratingAvg,
        Integer ratingCount,
        List<SubjectSummary> subjects,
        List<JobHistoryEntry> jobHistory,
        long acceptedConnectionCount,
        List<ConnectionPreview> connectionPreviews,
        List<CoursePreview> courses
) {
}
