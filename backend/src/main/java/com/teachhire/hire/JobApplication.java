package com.teachhire.hire;

import com.teachhire.profile.TeacherProfile;
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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "job_applications",
        uniqueConstraints = @UniqueConstraint(name = "uq_job_teacher", columnNames = {"job_id", "teacher_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPosting jobPosting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private TeacherProfile teacherProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private Instant appliedAt;

    @PrePersist
    protected void onCreate() {
        this.appliedAt = Instant.now();
        if (this.status == null) {
            this.status = ApplicationStatus.APPLIED;
        }
    }

    public JobApplication(JobPosting jobPosting, TeacherProfile teacherProfile) {
        this.jobPosting = jobPosting;
        this.teacherProfile = teacherProfile;
        this.status = ApplicationStatus.APPLIED;
    }
}
