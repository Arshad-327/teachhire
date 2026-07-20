package com.teachhire.hire;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    @Query("""
            SELECT j FROM JobPosting j
            WHERE (:subjectId IS NULL OR j.subject.id = :subjectId)
              AND (:status IS NULL OR j.status = :status)
            """)
    Page<JobPosting> search(@Param("subjectId") Long subjectId, @Param("status") JobStatus status, Pageable pageable);

    List<JobPosting> findByInstitutionIdOrderByPostedAtDesc(Long institutionId);
}
