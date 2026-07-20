package com.teachhire.learn;

import com.teachhire.auth.UserPrincipal;
import com.teachhire.learn.dto.AddCourseContentRequest;
import com.teachhire.learn.dto.CourseContentResponse;
import com.teachhire.learn.dto.CourseDetailResponse;
import com.teachhire.learn.dto.CourseResponse;
import com.teachhire.learn.dto.CreateCourseRequest;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping("/api/courses")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<CourseResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateCourseRequest request
    ) {
        CourseResponse response = courseService.createCourse(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/courses/{id}/publish")
    @PreAuthorize("hasRole('TEACHER')")
    public CourseResponse publish(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return courseService.publish(principal.getId(), id);
    }

    @PostMapping("/api/courses/{id}/content")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<CourseContentResponse> addContent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddCourseContentRequest request
    ) {
        CourseContentResponse response = courseService.addContent(principal.getId(), id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/courses")
    public Page<CourseResponse> search(
            @RequestParam(required = false) Long subject,
            @RequestParam(required = false) BigDecimal priceMax,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return courseService.search(subject, priceMax, pageable);
    }

    @GetMapping("/api/courses/{id}")
    public CourseDetailResponse getById(
            @AuthenticationPrincipal(errorOnInvalidType = false) UserPrincipal principal,
            @PathVariable Long id
    ) {
        Long callerUserId = principal != null ? principal.getId() : null;
        return courseService.getDetail(id, callerUserId);
    }

    @GetMapping("/api/teachers/me/courses")
    @PreAuthorize("hasRole('TEACHER')")
    public List<CourseResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return courseService.listMine(principal.getId());
    }
}
