package com.teachhire.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstitutionProfileRepository extends JpaRepository<InstitutionProfile, Long> {

    Optional<InstitutionProfile> findByUserId(Long userId);
}
