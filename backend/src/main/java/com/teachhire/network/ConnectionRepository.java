package com.teachhire.network;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    @Query("""
            SELECT COUNT(c) > 0 FROM Connection c
            WHERE (c.requester.id = :teacherAId AND c.receiver.id = :teacherBId)
               OR (c.requester.id = :teacherBId AND c.receiver.id = :teacherAId)
            """)
    boolean existsBetween(@Param("teacherAId") Long teacherAId, @Param("teacherBId") Long teacherBId);

    List<Connection> findByRequesterIdOrReceiverIdOrderByCreatedAtDesc(Long requesterId, Long receiverId);

    List<Connection> findByReceiverIdAndStatusOrderByCreatedAtDesc(Long receiverId, ConnectionStatus status);

    @Query("""
            SELECT COUNT(c) FROM Connection c
            WHERE c.status = :status AND (c.requester.id = :teacherId OR c.receiver.id = :teacherId)
            """)
    long countByStatusForTeacher(@Param("teacherId") Long teacherId, @Param("status") ConnectionStatus status);

    @Query("""
            SELECT c FROM Connection c
            WHERE c.status = :status AND (c.requester.id = :teacherId OR c.receiver.id = :teacherId)
            ORDER BY c.createdAt DESC
            """)
    List<Connection> findByStatusForTeacher(@Param("teacherId") Long teacherId, @Param("status") ConnectionStatus status, Pageable pageable);
}
