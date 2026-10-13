package com.sms.repository;

import com.sms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCode(String code);
    boolean existsByLecturerId(Long lecturerId);
}
