package com.teachhire.learn;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
            SELECT c FROM Course c
            WHERE c.published = true
              AND (:subjectId IS NULL OR c.subject.id = :subjectId)
              AND (:priceMax IS NULL OR c.price <= :priceMax)
            """)
    Page<Course> searchPublished(@Param("subjectId") Long subjectId, @Param("priceMax") BigDecimal priceMax, Pageable pageable);

    List<Course> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    List<Course> findByTeacherIdAndPublishedTrueOrderByCreatedAtDesc(Long teacherId);
}
