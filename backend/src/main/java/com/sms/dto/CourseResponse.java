package com.sms.dto;

public record CourseResponse(
        Long id,
        String code,
        String title,
        String description,
        int credits,
        int capacity,
        long enrolledCount,
        Long lecturerId,
        String lecturerName,
        boolean enrolled) {
}
