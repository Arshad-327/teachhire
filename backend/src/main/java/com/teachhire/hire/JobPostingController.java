package com.teachhire.hire;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.hire.dto.CreateJobPostingRequest;
import com.teachhire.hire.dto.JobPostingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService jobPostingService;

    @PostMapping("/api/jobs")
    @PreAuthorize("hasRole('INSTITUTION')")
    public ResponseEntity<JobPostingResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateJobPostingRequest request
    ) {
        JobPostingResponse response = jobPostingService.createJobPosting(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/jobs")
    public Page<JobPostingResponse> search(
            @RequestParam(required = false) Long subject,
            @RequestParam(required = false) JobStatus status,
            @PageableDefault(size = 20, sort = "postedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return jobPostingService.search(subject, status, pageable);
    }

    @GetMapping("/api/jobs/{id}")
    public JobPostingResponse getById(@PathVariable Long id) {
        return jobPostingService.getById(id);
    }

    @GetMapping("/api/institutions/me/jobs")
    @PreAuthorize("hasRole('INSTITUTION')")
    public List<JobPostingResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return jobPostingService.listMine(principal.getId());
    }
}
