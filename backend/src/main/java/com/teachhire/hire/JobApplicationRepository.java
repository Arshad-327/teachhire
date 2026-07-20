package com.teachhire.hire;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByJobPostingIdAndTeacherProfileId(Long jobPostingId, Long teacherProfileId);

    List<JobApplication> findByTeacherProfileIdOrderByAppliedAtDesc(Long teacherProfileId);
}
