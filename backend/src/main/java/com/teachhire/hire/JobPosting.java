package com.teachhire.hire;

import com.teachhire.profile.InstitutionProfile;
import com.teachhire.profile.Subject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private InstitutionProfile institution;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "salary_range")
    private String salaryRange;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private Instant postedAt;

    @PrePersist
    protected void onCreate() {
        this.postedAt = Instant.now();
        if (this.status == null) {
            this.status = JobStatus.OPEN;
        }
    }

    public JobPosting(InstitutionProfile institution, String title, String description, Subject subject, String salaryRange) {
        this.institution = institution;
        this.title = title;
        this.description = description;
        this.subject = subject;
        this.salaryRange = salaryRange;
        this.status = JobStatus.OPEN;
    }
}
