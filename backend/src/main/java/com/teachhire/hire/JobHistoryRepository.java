package com.teachhire.hire;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobHistoryRepository extends JpaRepository<JobHistory, Long> {

    List<JobHistory> findByTeacherIdOrderByHiredAtDesc(Long teacherId);
}
