package com.sms.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollmentRequest(
        @NotNull(message = "Course is required") Long courseId,
        Long studentId) {
}
