package com.teachhire.learn.dto;

import com.teachhire.learn.ContentType;

public record CourseContentResponse(
        Long id,
        String title,
        ContentType contentType,
        String contentUrl,
        Integer orderIndex
) {
}
