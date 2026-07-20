package com.teachhire.bulletin;

import com.teachhire.profile.InstitutionProfile;
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
import java.time.LocalDate;

@Entity
@Table(name = "bulletins")
@Getter
@Setter
@NoArgsConstructor
public class Bulletin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private InstitutionProfile institution;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BulletinCategory category;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "posted_at", nullable = false, updatable = false)
    private Instant postedAt;

    @PrePersist
    protected void onCreate() {
        this.postedAt = Instant.now();
    }

    public Bulletin(InstitutionProfile institution, String title, String content, BulletinCategory category, LocalDate validUntil) {
        this.institution = institution;
        this.title = title;
        this.content = content;
        this.category = category;
        this.validUntil = validUntil;
    }
}
