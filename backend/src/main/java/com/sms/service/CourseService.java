package com.sms.service;

import com.sms.dto.CourseRequest;
import com.sms.dto.CourseResponse;
import com.sms.dto.EnrollmentResponse;
import com.sms.entity.User;

import java.util.List;

public interface CourseService {
    List<CourseResponse> findAll(User current);
    CourseResponse findById(Long id, User current);
    CourseResponse create(CourseRequest request, User current);
    CourseResponse update(Long id, CourseRequest request, User current);
    void delete(Long id);
    List<EnrollmentResponse> students(Long courseId, User current);
}
