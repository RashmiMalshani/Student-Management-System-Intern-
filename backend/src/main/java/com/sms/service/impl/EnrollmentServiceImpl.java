package com.sms.service.impl;

import com.sms.service.EnrollmentService;

import com.sms.dto.EnrollmentRequest;
import com.sms.dto.EnrollmentResponse;
import com.sms.entity.Course;
import com.sms.entity.Enrollment;
import com.sms.entity.Role;
import com.sms.entity.User;
import com.sms.exception.BadRequestException;
import com.sms.exception.ConflictException;
import com.sms.exception.ForbiddenException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.EnrollmentRepository;
import com.sms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;
    private final UserRepository users;

    public EnrollmentServiceImpl(EnrollmentRepository enrollments, CourseRepository courses, UserRepository users) {
        this.enrollments = enrollments;
        this.courses = courses;
        this.users = users;
    }

    @Transactional
    @Override
    public EnrollmentResponse enroll(EnrollmentRequest req, User current) {
        User student;
        if (current.getRole() == Role.STUDENT) {
            student = current;
        } else {
            // ADMIN enrolls on behalf of a student
            if (req.studentId() == null) {
                throw new BadRequestException("studentId is required");
            }
            student = users.findById(req.studentId())
                    .filter(u -> u.getRole() == Role.STUDENT)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        }

        Course course = courses.findById(req.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (enrollments.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new ConflictException("Already enrolled in " + course.getCode());
        }
        if (enrollments.countByCourseId(course.getId()) >= course.getCapacity()) {
            throw new ConflictException(course.getCode() + " is full");
        }

        Enrollment e = new Enrollment();
        e.setStudent(student);
        e.setCourse(course);
        return EnrollmentResponse.from(enrollments.save(e));
    }

    @Transactional
    @Override
    public void unenroll(Long enrollmentId, User current) {
        Enrollment e = enrollments.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        if (current.getRole() == Role.STUDENT && !e.getStudent().getId().equals(current.getId())) {
            throw new ForbiddenException("You can only remove your own enrollments");
        }
        enrollments.delete(e);
    }

    @Transactional(readOnly = true)
    @Override
    public List<EnrollmentResponse> mine(User current) {
        return enrollments.findByStudentId(current.getId()).stream().map(EnrollmentResponse::from).toList();
    }

    /** ADMIN: every enrollment. LECTURER: enrollments in their own courses. */
    @Transactional(readOnly = true)
    @Override
    public List<EnrollmentResponse> visibleTo(User current) {
        List<Enrollment> list = current.getRole() == Role.ADMIN
                ? enrollments.findAll()
                : enrollments.findByCourseLecturerId(current.getId());
        return list.stream().map(EnrollmentResponse::from).toList();
    }
}
