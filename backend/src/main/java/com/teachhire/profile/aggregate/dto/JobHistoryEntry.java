package com.teachhire.profile.aggregate.dto;

import java.time.Instant;

public record JobHistoryEntry(
        String institutionName,
        String jobTitle,
        Instant hiredAt
) {
}
