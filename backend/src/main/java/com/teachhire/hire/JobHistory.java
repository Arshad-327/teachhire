package com.teachhire.hire;

import com.teachhire.profile.InstitutionProfile;
import com.teachhire.profile.TeacherProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/**
 * Append-only hiring record written whenever a JobApplication transitions to HIRED.
 * Feeds the unified teacher profile page (not built yet).
 */
@Entity
@Table(name = "job_history")
@Getter
@Setter
@NoArgsConstructor
public class JobHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private TeacherProfile teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private InstitutionProfile institution;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "hired_at", nullable = false, updatable = false)
    private Instant hiredAt;

    @PrePersist
    protected void onCreate() {
        if (this.hiredAt == null) {
            this.hiredAt = Instant.now();
        }
    }

    public JobHistory(TeacherProfile teacher, InstitutionProfile institution, String jobTitle) {
        this.teacher = teacher;
        this.institution = institution;
        this.jobTitle = jobTitle;
    }
}
