package com.teachhire.learn.dto;

import java.util.List;

public record CourseReviewsResponse(
        List<ReviewResponse> reviews,
        Double averageRating,
        Long reviewCount
) {
}
