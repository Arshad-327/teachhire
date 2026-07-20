package com.teachhire.learn;

import com.teachhire.common.ApiException;
import com.teachhire.learn.dto.AddCourseContentRequest;
import com.teachhire.learn.dto.CourseContentResponse;
import com.teachhire.learn.dto.CourseDetailResponse;
import com.teachhire.learn.dto.CourseResponse;
import com.teachhire.learn.dto.CreateCourseRequest;
import com.teachhire.profile.Subject;
import com.teachhire.profile.SubjectRepository;
import com.teachhire.profile.TeacherProfile;
import com.teachhire.profile.TeacherProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseContentRepository courseContentRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public CourseResponse createCourse(Long userId, CreateCourseRequest request) {
        TeacherProfile teacher = resolveTeacher(userId);

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subject not found"));

        Course course = new Course(teacher, request.title(), request.description(), subject, request.price(), request.thumbnailUrl());
        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    @Transactional
    public CourseResponse publish(Long userId, Long courseId) {
        TeacherProfile teacher = resolveTeacher(userId);
        Course course = loadOwnedCourse(courseId, teacher);

        course.setPublished(true);
        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    @Transactional
    public CourseContentResponse addContent(Long userId, Long courseId, AddCourseContentRequest request) {
        TeacherProfile teacher = resolveTeacher(userId);
        Course course = loadOwnedCourse(courseId, teacher);

        CourseContent content = new CourseContent(course, request.title(), request.contentType(), request.contentUrl(), request.orderIndex());
        CourseContent saved = courseContentRepository.save(content);
        return toContentResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> search(Long subjectId, BigDecimal priceMax, Pageable pageable) {
        return courseRepository.searchPublished(subjectId, priceMax, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CourseDetailResponse getDetail(Long courseId, Long callerUserId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.isPublished() && !isOwner(course, callerUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This course is not published");
        }

        List<CourseContentResponse> contents = courseContentRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(this::toContentResponse)
                .toList();

        return toDetailResponse(course, contents);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> listMine(Long userId) {
        TeacherProfile teacher = resolveTeacher(userId);
        return courseRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private boolean isOwner(Course course, Long callerUserId) {
        if (callerUserId == null) {
            return false;
        }
        return teacherProfileRepository.findByUserId(callerUserId)
                .map(t -> t.getId().equals(course.getTeacher().getId()))
                .orElse(false);
    }

    private Course loadOwnedCourse(Long courseId, TeacherProfile teacher) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own this course");
        }
        return course;
    }

    private TeacherProfile resolveTeacher(Long userId) {
        return teacherProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found for current user"));
    }

    private CourseResponse toResponse(Course c) {
        return new CourseResponse(
                c.getId(),
                c.getTeacher().getId(),
                c.getTeacher().getFullName(),
                c.getTitle(),
                c.getDescription(),
                c.getSubject().getId(),
                c.getSubject().getName(),
                c.getPrice(),
                c.getThumbnailUrl(),
                c.isPublished(),
                c.getCreatedAt()
        );
    }

    private CourseDetailResponse toDetailResponse(Course c, List<CourseContentResponse> contents) {
        return new CourseDetailResponse(
                c.getId(),
                c.getTeacher().getId(),
                c.getTeacher().getFullName(),
                c.getTitle(),
                c.getDescription(),
                c.getSubject().getId(),
                c.getSubject().getName(),
                c.getPrice(),
                c.getThumbnailUrl(),
                c.isPublished(),
                c.getCreatedAt(),
                contents
        );
    }

    private CourseContentResponse toContentResponse(CourseContent cc) {
        return new CourseContentResponse(
                cc.getId(),
                cc.getTitle(),
                cc.getContentType(),
                cc.getContentUrl(),
                cc.getOrderIndex()
        );
    }
}
