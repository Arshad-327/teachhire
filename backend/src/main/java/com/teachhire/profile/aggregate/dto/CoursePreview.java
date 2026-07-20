package com.teachhire.profile.aggregate.dto;

import java.math.BigDecimal;

public record CoursePreview(
        Long id,
        String title,
        BigDecimal price,
        String thumbnailUrl
) {
}
