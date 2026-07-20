package com.teachhire.bulletin.dto;

import com.teachhire.bulletin.BulletinCategory;

import java.time.Instant;
import java.time.LocalDate;

public record BulletinResponse(
        Long id,
        Long institutionId,
        String institutionName,
        String title,
        String content,
        BulletinCategory category,
        LocalDate validUntil,
        Instant postedAt
) {
}
