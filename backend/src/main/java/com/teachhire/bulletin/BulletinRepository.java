package com.teachhire.bulletin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BulletinRepository extends JpaRepository<Bulletin, Long> {

    @Query("""
            SELECT b FROM Bulletin b
            WHERE (:category IS NULL OR b.category = :category)
              AND (:institutionId IS NULL OR b.institution.id = :institutionId)
              AND (b.validUntil IS NULL OR b.validUntil >= :today)
            """)
    Page<Bulletin> searchActive(
            @Param("category") BulletinCategory category,
            @Param("institutionId") Long institutionId,
            @Param("today") LocalDate today,
            Pageable pageable
    );

    List<Bulletin> findByInstitutionIdOrderByPostedAtDesc(Long institutionId);
}
