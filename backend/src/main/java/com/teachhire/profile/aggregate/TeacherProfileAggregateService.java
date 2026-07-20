package com.teachhire.profile.aggregate;

import com.teachhire.common.ApiException;
import com.teachhire.hire.JobHistory;
import com.teachhire.hire.JobHistoryRepository;
import com.teachhire.learn.Course;
import com.teachhire.learn.CourseRepository;
import com.teachhire.network.Connection;
import com.teachhire.network.ConnectionRepository;
import com.teachhire.network.ConnectionStatus;
import com.teachhire.profile.TeacherProfile;
import com.teachhire.profile.TeacherProfileRepository;
import com.teachhire.profile.aggregate.dto.ConnectionPreview;
import com.teachhire.profile.aggregate.dto.CoursePreview;
import com.teachhire.profile.aggregate.dto.JobHistoryEntry;
import com.teachhire.profile.aggregate.dto.SubjectSummary;
import com.teachhire.profile.aggregate.dto.TeacherProfileAggregateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Composes the public teacher profile page from across modules with a handful of
 * separate queries rather than one large join — this endpoint is low-frequency
 * (a single profile-page load), so simplicity/readability wins over shaving round trips.
 */
@Service
@RequiredArgsConstructor
public class TeacherProfileAggregateService {

    private static final int CONNECTION_PREVIEW_LIMIT = 5;

    private final TeacherProfileRepository teacherProfileRepository;
    private final JobHistoryRepository jobHistoryRepository;
    private final ConnectionRepository connectionRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public TeacherProfileAggregateResponse getAggregateProfile(Long teacherId) {
        TeacherProfile teacher = teacherProfileRepository.findById(teacherId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found"));

        List<SubjectSummary> subjects = teacher.getSubjects().stream()
                .map(s -> new SubjectSummary(s.getId(), s.getName()))
                .toList();

        List<JobHistoryEntry> jobHistory = jobHistoryRepository.findByTeacherIdOrderByHiredAtDesc(teacherId)
                .stream()
                .map(this::toJobHistoryEntry)
                .toList();

        long acceptedConnectionCount = connectionRepository.countByStatusForTeacher(teacherId, ConnectionStatus.ACCEPTED);

        List<ConnectionPreview> connectionPreviews = connectionRepository
                .findByStatusForTeacher(teacherId, ConnectionStatus.ACCEPTED, PageRequest.of(0, CONNECTION_PREVIEW_LIMIT))
                .stream()
                .map(c -> toConnectionPreview(c, teacherId))
                .toList();

        List<CoursePreview> courses = courseRepository.findByTeacherIdAndPublishedTrueOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(this::toCoursePreview)
                .toList();

        return new TeacherProfileAggregateResponse(
                teacher.getId(),
                teacher.getFullName(),
                teacher.getHeadline(),
                teacher.getBio(),
                teacher.getAvatarUrl(),
                teacher.getYearsExperience(),
                teacher.getRatingAvg(),
                teacher.getRatingCount(),
                subjects,
                jobHistory,
                acceptedConnectionCount,
                connectionPreviews,
                courses
        );
    }

    private JobHistoryEntry toJobHistoryEntry(JobHistory h) {
        return new JobHistoryEntry(h.getInstitution().getInstitutionName(), h.getJobTitle(), h.getHiredAt());
    }

    private ConnectionPreview toConnectionPreview(Connection c, Long viewedTeacherId) {
        TeacherProfile other = c.getRequester().getId().equals(viewedTeacherId) ? c.getReceiver() : c.getRequester();
        return new ConnectionPreview(other.getId(), other.getFullName(), other.getAvatarUrl());
    }

    private CoursePreview toCoursePreview(Course c) {
        return new CoursePreview(c.getId(), c.getTitle(), c.getPrice(), c.getThumbnailUrl());
    }
}
