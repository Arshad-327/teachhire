package com.teachhire.learn;

import com.teachhire.common.ApiException;
import com.teachhire.learn.dto.EnrollmentResponse;
import com.teachhire.profile.StudentProfile;
import com.teachhire.profile.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Transactional
    public EnrollmentResponse enroll(Long userId, Long courseId) {
        StudentProfile student = resolveStudent(userId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        // unpublished courses aren't discoverable, so treat enrolling in one as not-found too
        if (!course.isPublished()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Course not found");
        }

        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "You are already enrolled in this course");
        }

        PaymentStatus paymentStatus = course.getPrice().compareTo(BigDecimal.ZERO) == 0
                ? PaymentStatus.FREE
                : PaymentStatus.PAID;

        Enrollment enrollment = new Enrollment(student, course, paymentStatus);
        try {
            Enrollment saved = enrollmentRepository.save(enrollment);
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT, "You are already enrolled in this course");
        }
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> listMine(Long userId) {
        StudentProfile student = resolveStudent(userId);
        return enrollmentRepository.findByStudentIdOrderByEnrolledAtDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StudentProfile resolveStudent(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student profile not found for current user"));
    }

    private EnrollmentResponse toResponse(Enrollment e) {
        return new EnrollmentResponse(
                e.getId(),
                e.getCourse().getId(),
                e.getCourse().getTitle(),
                e.getCourse().getTeacher().getFullName(),
                e.getCourse().getPrice(),
                e.getPaymentStatus(),
                e.getEnrolledAt()
        );
    }
}
