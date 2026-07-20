package com.teachhire.profile.aggregate.dto;

public record ConnectionPreview(
        Long teacherId,
        String fullName,
        String avatarUrl
) {
}
