package com.teachhire.learn;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.learn.dto.CourseReviewsResponse;
import com.teachhire.learn.dto.CreateReviewRequest;
import com.teachhire.learn.dto.ReviewResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/courses/{id}/review")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewResponse response = reviewService.createReview(principal.getId(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/courses/{id}/reviews")
    public CourseReviewsResponse listForCourse(@PathVariable Long id) {
        return reviewService.listForCourse(id);
    }
}
