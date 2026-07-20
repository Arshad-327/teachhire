package com.teachhire.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long userId);
}
