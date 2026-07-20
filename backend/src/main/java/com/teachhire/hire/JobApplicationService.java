package com.teachhire.hire;

import com.teachhire.common.ApiException;
import com.teachhire.hire.dto.JobApplicationResponse;
import com.teachhire.hire.dto.UpdateApplicationStatusRequest;
import com.teachhire.profile.InstitutionProfile;
import com.teachhire.profile.InstitutionProfileRepository;
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
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final JobHistoryRepository jobHistoryRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final InstitutionProfileRepository institutionProfileRepository;

    @Transactional
    public JobApplicationResponse apply(Long userId, Long jobId) {
        TeacherProfile teacher = resolveTeacher(userId);

        JobPosting jobPosting = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job posting not found"));

        if (jobApplicationRepository.existsByJobPostingIdAndTeacherProfileId(jobPosting.getId(), teacher.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already applied to this job");
        }

        JobApplication application = new JobApplication(jobPosting, teacher);
        try {
            JobApplication saved = jobApplicationRepository.save(application);
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            // race: two concurrent applies for the same job+teacher hit the unique constraint
            throw new ApiException(HttpStatus.CONFLICT, "You have already applied to this job");
        }
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> listMine(Long userId) {
        TeacherProfile teacher = resolveTeacher(userId);
        return jobApplicationRepository.findByTeacherProfileIdOrderByAppliedAtDesc(teacher.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public JobApplicationResponse updateStatus(Long userId, Long applicationId, UpdateApplicationStatusRequest request) {
        InstitutionProfile institution = resolveInstitution(userId);

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));

        JobPosting jobPosting = application.getJobPosting();
        if (!jobPosting.getInstitution().getId().equals(institution.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not own the job posting for this application");
        }

        ApplicationStatus previousStatus = application.getStatus();
        ApplicationStatus newStatus = request.status();
        application.setStatus(newStatus);
        JobApplication saved = jobApplicationRepository.save(application);

        if (newStatus == ApplicationStatus.HIRED && previousStatus != ApplicationStatus.HIRED) {
            JobHistory history = new JobHistory(saved.getTeacherProfile(), institution, jobPosting.getTitle());
            jobHistoryRepository.save(history);
        }

        return toResponse(saved);
    }

    private TeacherProfile resolveTeacher(Long userId) {
        return teacherProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Teacher profile not found for current user"));
    }

    private InstitutionProfile resolveInstitution(Long userId) {
        return institutionProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution profile not found for current user"));
    }

    private JobApplicationResponse toResponse(JobApplication a) {
        return new JobApplicationResponse(
                a.getId(),
                a.getJobPosting().getId(),
                a.getJobPosting().getTitle(),
                a.getJobPosting().getInstitution().getInstitutionName(),
                a.getTeacherProfile().getId(),
                a.getTeacherProfile().getFullName(),
                a.getStatus(),
                a.getAppliedAt()
        );
    }
}
