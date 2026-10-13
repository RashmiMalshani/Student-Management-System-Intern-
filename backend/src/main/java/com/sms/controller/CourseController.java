package com.sms.controller;

import com.sms.dto.CourseRequest;
import com.sms.dto.CourseResponse;
import com.sms.dto.EnrollmentResponse;
import com.sms.entity.User;
import com.sms.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    /** Any logged-in user can browse courses. */
    @GetMapping
    public List<CourseResponse> list(@AuthenticationPrincipal User user) {
        return courseService.findAll(user);
    }

    @GetMapping("/{id}")
    public CourseResponse get(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return courseService.findById(id, user);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponse create(@Valid @RequestBody CourseRequest req, @AuthenticationPrincipal User user) {
        return courseService.create(req, user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    public CourseResponse update(@PathVariable Long id, @Valid @RequestBody CourseRequest req,
                                 @AuthenticationPrincipal User user) {
        return courseService.update(id, req, user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        courseService.delete(id);
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER')")
    public List<EnrollmentResponse> students(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return courseService.students(id, user);
    }
}
