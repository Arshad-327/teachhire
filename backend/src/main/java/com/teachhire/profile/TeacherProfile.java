package com.teachhire.profile;

import com.teachhire.auth.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "teacher_profiles")
@Getter
@Setter
@NoArgsConstructor
public class TeacherProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name")
    private String fullName;

    private String headline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(name = "rating_avg")
    private Double ratingAvg;

    @Column(name = "rating_count")
    private Integer ratingCount;

    @ManyToMany
    @JoinTable(
            name = "teacher_profile_subjects",
            joinColumns = @JoinColumn(name = "teacher_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects = new HashSet<>();

    public TeacherProfile(User user) {
        this.user = user;
        this.ratingAvg = 0.0;
        this.ratingCount = 0;
    }
}
