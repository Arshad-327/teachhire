package com.teachhire.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByName(String name);
}
