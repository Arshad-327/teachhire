package com.teachhire.learn;

import com.teachhire.profile.StudentProfile;
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
        name = "enrollments",
        uniqueConstraints = @UniqueConstraint(name = "uq_student_course", columnNames = {"student_id", "course_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private Instant enrolledAt;

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = Instant.now();
    }

    public Enrollment(StudentProfile student, Course course, PaymentStatus paymentStatus) {
        this.student = student;
        this.course = course;
        this.paymentStatus = paymentStatus;
    }
}
