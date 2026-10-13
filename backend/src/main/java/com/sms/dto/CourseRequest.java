package com.sms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CourseRequest(
        @NotBlank(message = "Course code is required") @Size(max = 20) String code,
        @NotBlank(message = "Title is required") @Size(max = 150) String title,
        @Size(max = 1000) String description,
        @Min(value = 1, message = "Credits must be at least 1") @Max(value = 10, message = "Credits cannot exceed 10") int credits,
        @Min(value = 1, message = "Capacity must be at least 1") int capacity,
        Long lecturerId) {
}
