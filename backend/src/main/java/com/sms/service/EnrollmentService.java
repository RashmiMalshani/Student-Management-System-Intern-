package com.sms.service;

import com.sms.dto.EnrollmentRequest;
import com.sms.dto.EnrollmentResponse;
import com.sms.entity.User;

import java.util.List;

public interface EnrollmentService {
    EnrollmentResponse enroll(EnrollmentRequest request, User current);
    void unenroll(Long enrollmentId, User current);
    List<EnrollmentResponse> mine(User current);
    List<EnrollmentResponse> visibleTo(User current);
}
