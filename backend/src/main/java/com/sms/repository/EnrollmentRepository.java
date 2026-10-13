package com.sms.repository;

import com.sms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByCourseLecturerId(Long lecturerId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    long countByCourseId(Long courseId);
    void deleteByCourseId(Long courseId);
    void deleteByStudentId(Long studentId);
}
