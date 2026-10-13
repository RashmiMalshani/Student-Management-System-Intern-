package com.sms.controller;

import com.sms.dto.EnrollmentRequest;
import com.sms.dto.EnrollmentResponse;
import com.sms.entity.User;
import com.sms.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentResponse enroll(@Valid @RequestBody EnrollmentRequest req, @AuthenticationPrincipal User user) {
        return enrollmentService.enroll(req, user);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<EnrollmentResponse> mine(@AuthenticationPrincipal User user) {
        return enrollmentService.mine(user);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    public List<EnrollmentResponse> all(@AuthenticationPrincipal User user) {
        return enrollmentService.visibleTo(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unenroll(@PathVariable Long id, @AuthenticationPrincipal User user) {
        enrollmentService.unenroll(id, user);
    }
}
