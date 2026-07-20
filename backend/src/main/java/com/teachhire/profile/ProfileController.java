package com.teachhire.profile;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.profile.dto.InstitutionProfileResponse;
import com.teachhire.profile.dto.TeacherProfileResponse;
import com.teachhire.profile.dto.UpdateInstitutionProfileRequest;
import com.teachhire.profile.dto.UpdateTeacherProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/api/teachers/me/profile")
    @PreAuthorize("hasRole('TEACHER')")
    public TeacherProfileResponse getMyTeacherProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return profileService.getMyTeacherProfile(principal.getId());
    }

    @PutMapping("/api/teachers/me/profile")
    @PreAuthorize("hasRole('TEACHER')")
    public TeacherProfileResponse updateTeacherProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateTeacherProfileRequest request
    ) {
        return profileService.updateTeacherProfile(principal.getId(), request);
    }

    @PutMapping("/api/institutions/me/profile")
    @PreAuthorize("hasRole('INSTITUTION')")
    public InstitutionProfileResponse updateInstitutionProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateInstitutionProfileRequest request
    ) {
        return profileService.updateInstitutionProfile(principal.getId(), request);
    }
}
