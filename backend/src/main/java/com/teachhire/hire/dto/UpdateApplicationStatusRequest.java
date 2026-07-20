package com.teachhire.hire.dto;

import com.teachhire.hire.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateApplicationStatusRequest(

        @NotNull
        ApplicationStatus status
) {
}
