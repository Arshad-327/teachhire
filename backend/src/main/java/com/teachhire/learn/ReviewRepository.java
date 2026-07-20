package com.teachhire.learn;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    List<Review> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    /**
     * Recomputed from every review across all of the teacher's courses (not an
     * incremental update), so it never drifts from floating-point accumulation.
     */
    @Query("""
            SELECT AVG(r.rating) as averageRating, COUNT(r) as reviewCount
            FROM Review r
            WHERE r.course.teacher.id = :teacherId
            """)
    TeacherRatingAggregate aggregateRatingsForTeacher(@Param("teacherId") Long teacherId);

    interface TeacherRatingAggregate {
        Double getAverageRating();

        Long getReviewCount();
    }
}
