package com.teachhire.learn;

import com.teachhire.common.ApiException;
import com.teachhire.learn.dto.CourseReviewsResponse;
import com.teachhire.learn.dto.CreateReviewRequest;
import com.teachhire.learn.dto.ReviewResponse;
import com.teachhire.profile.StudentProfile;
import com.teachhire.profile.StudentProfileRepository;
import com.teachhire.profile.TeacherProfile;
import com.teachhire.profile.TeacherProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    @Transactional
    public ReviewResponse createReview(Long userId, Long courseId, CreateReviewRequest request) {
        StudentProfile student = resolveStudent(userId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You must be enrolled in this course to review it");
        }

        if (reviewRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already reviewed this course");
        }

        Review review = new Review(course, student, request.rating(), request.comment());
        Review saved;
        try {
            saved = reviewRepository.save(review);
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already reviewed this course");
        }

        recalculateTeacherRating(course.getTeacher().getId());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public CourseReviewsResponse listForCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Course not found");
        }

        List<Review> reviews = reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        List<ReviewResponse> responses = reviews.stream().map(this::toResponse).toList();

        double average = reviews.isEmpty()
                ? 0.0
                : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        return new CourseReviewsResponse(responses, round(average), (long) reviews.size());
    }

    /**
     * Recomputes rating_avg/rating_count from every review across all of the teacher's
     * courses (not an incremental update), so repeated updates never drift.
     */
    private void recalculateTeacherRating(Long teacherId) {
        ReviewRepository.TeacherRatingAggregate aggregate = reviewRepository.aggregateRatingsForTeacher(teacherId);
        TeacherProfile teacher = teacherProfileRepository.findById(teacherId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found"));

        double average = aggregate.getAverageRating() != null ? aggregate.getAverageRating() : 0.0;
        long count = aggregate.getReviewCount() != null ? aggregate.getReviewCount() : 0L;

        teacher.setRatingAvg(round(average));
        teacher.setRatingCount((int) count);
        teacherProfileRepository.save(teacher);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private StudentProfile resolveStudent(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student profile not found for current user"));
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getCourse().getId(),
                r.getStudent().getId(),
                r.getStudent().getFullName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
