package com.teachhire.network.dto;

import com.teachhire.network.ConnectionStatus;

import java.time.Instant;

/**
 * A connection as seen from the perspective of the authenticated teacher —
 * "otherTeacher" is whichever side of the row isn't the caller.
 */
public record ConnectionSummaryResponse(
        Long connectionId,
        Long otherTeacherId,
        String otherTeacherName,
        ConnectionStatus status,
        Instant createdAt,
        Instant respondedAt
) {
}
