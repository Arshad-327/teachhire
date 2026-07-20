package com.teachhire.learn;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.learn.dto.EnrollmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/api/courses/{id}/enroll")
    public ResponseEntity<EnrollmentResponse> enroll(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        EnrollmentResponse response = enrollmentService.enroll(principal.getId(), id);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/students/me/enrollments")
    public List<EnrollmentResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return enrollmentService.listMine(principal.getId());
    }
}
