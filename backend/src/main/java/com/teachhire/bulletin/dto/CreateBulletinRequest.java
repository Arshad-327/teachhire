package com.teachhire.bulletin.dto;

import com.teachhire.bulletin.BulletinCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateBulletinRequest(

        @NotBlank
        String title,

        @NotBlank
        String content,

        @NotNull
        BulletinCategory category,

        LocalDate validUntil
) {
}
