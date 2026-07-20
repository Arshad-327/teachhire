package com.teachhire.hire;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.hire.dto.JobApplicationResponse;
import com.teachhire.hire.dto.UpdateApplicationStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping("/api/jobs/{id}/apply")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<JobApplicationResponse> apply(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long jobId
    ) {
        JobApplicationResponse response = jobApplicationService.apply(principal.getId(), jobId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/applications/{id}/status")
    @PreAuthorize("hasRole('INSTITUTION')")
    public JobApplicationResponse updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        return jobApplicationService.updateStatus(principal.getId(), id, request);
    }

    @GetMapping("/api/teachers/me/applications")
    @PreAuthorize("hasRole('TEACHER')")
    public List<JobApplicationResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return jobApplicationService.listMine(principal.getId());
    }
}
