package com.teachhire.network.dto;

import jakarta.validation.constraints.NotNull;

public record RespondToConnectionRequest(

        @NotNull
        Boolean accept
) {
}
