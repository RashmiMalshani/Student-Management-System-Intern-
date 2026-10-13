package com.sms.dto;

import com.sms.entity.Enrollment;

import java.time.LocalDateTime;

public record EnrollmentResponse(
        Long id,
        Long courseId,
        String courseCode,
        String courseTitle,
        String lecturerName,
        Long studentId,
        String studentName,
        String studentEmail,
        LocalDateTime enrolledAt) {

    public static EnrollmentResponse from(Enrollment e) {
        return new EnrollmentResponse(
                e.getId(),
                e.getCourse().getId(),
                e.getCourse().getCode(),
                e.getCourse().getTitle(),
                e.getCourse().getLecturer() != null ? e.getCourse().getLecturer().getFullName() : null,
                e.getStudent().getId(),
                e.getStudent().getFullName(),
                e.getStudent().getEmail(),
                e.getEnrolledAt());
    }
}
