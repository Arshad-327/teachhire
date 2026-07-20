package com.teachhire.learn.dto;

import com.teachhire.learn.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddCourseContentRequest(

        @NotBlank
        String title,

        @NotNull
        ContentType contentType,

        @NotBlank
        String contentUrl,

        @NotNull
        Integer orderIndex
) {
}
