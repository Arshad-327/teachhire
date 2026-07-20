package com.teachhire.profile;

import com.teachhire.auth.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "institution_profiles")
@Getter
@Setter
@NoArgsConstructor
public class InstitutionProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "institution_name")
    private String institutionName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private InstitutionType type;

    private String address;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(name = "logo_url")
    private String logoUrl;

    public InstitutionProfile(User user) {
        this.user = user;
        this.verified = false;
    }
}
