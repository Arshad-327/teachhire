package com.teachhire.network.dto;

import com.teachhire.network.ConnectionStatus;

import java.time.Instant;

public record ConnectionResponse(
        Long id,
        Long requesterId,
        String requesterName,
        Long receiverId,
        String receiverName,
        ConnectionStatus status,
        Instant createdAt,
        Instant respondedAt
) {
}
