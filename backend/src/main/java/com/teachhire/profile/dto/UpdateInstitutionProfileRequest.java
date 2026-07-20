package com.teachhire.profile.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateInstitutionProfileRequest(

        @NotBlank
        String institutionName,

        String address,

        String logoUrl
) {
}
