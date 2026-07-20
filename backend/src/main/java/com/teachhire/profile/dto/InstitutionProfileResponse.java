package com.teachhire.profile.dto;

import com.teachhire.profile.InstitutionType;

public record InstitutionProfileResponse(
        Long id,
        String institutionName,
        InstitutionType type,
        String address,
        boolean verified,
        String logoUrl
) {
}
