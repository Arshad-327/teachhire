package com.teachhire.hire;

import com.teachhire.common.ApiException;
import com.teachhire.hire.dto.CreateJobPostingRequest;
import com.teachhire.hire.dto.JobPostingResponse;
import com.teachhire.profile.InstitutionProfile;
import com.teachhire.profile.InstitutionProfileRepository;
import com.teachhire.profile.Subject;
import com.teachhire.profile.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final InstitutionProfileRepository institutionProfileRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public JobPostingResponse createJobPosting(Long userId, CreateJobPostingRequest request) {
        InstitutionProfile institution = resolveInstitution(userId);

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subject not found"));

        JobPosting posting = new JobPosting(institution, request.title(), request.description(), subject, request.salaryRange());
        JobPosting saved = jobPostingRepository.save(posting);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<JobPostingResponse> search(Long subjectId, JobStatus status, Pageable pageable) {
        return jobPostingRepository.search(subjectId, status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public JobPostingResponse getById(Long id) {
        JobPosting posting = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job posting not found"));
        return toResponse(posting);
    }

    @Transactional(readOnly = true)
    public List<JobPostingResponse> listMine(Long userId) {
        InstitutionProfile institution = resolveInstitution(userId);
        return jobPostingRepository.findByInstitutionIdOrderByPostedAtDesc(institution.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private InstitutionProfile resolveInstitution(Long userId) {
        return institutionProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution profile not found for current user"));
    }

    private JobPostingResponse toResponse(JobPosting j) {
        return new JobPostingResponse(
                j.getId(),
                j.getInstitution().getId(),
                j.getInstitution().getInstitutionName(),
                j.getTitle(),
                j.getDescription(),
                j.getSubject().getId(),
                j.getSubject().getName(),
                j.getSalaryRange(),
                j.getStatus(),
                j.getPostedAt()
        );
    }
}
