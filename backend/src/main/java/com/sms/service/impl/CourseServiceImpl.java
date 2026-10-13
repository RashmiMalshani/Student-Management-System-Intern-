package com.sms.service.impl;

import com.sms.service.CourseService;

import com.sms.dto.CourseRequest;
import com.sms.dto.CourseResponse;
import com.sms.dto.EnrollmentResponse;
import com.sms.entity.Course;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courses;
    private final UserRepository users;
    private final EnrollmentRepository enrollments;

    public CourseServiceImpl(CourseRepository courses, UserRepository users, EnrollmentRepository enrollments) {
        this.courses = courses;
        this.users = users;
        this.enrollments = enrollments;
    }

    @Transactional(readOnly = true)
    @Override
    public List<CourseResponse> findAll(User current) {
        Set<Long> enrolledIds = current.getRole() == Role.STUDENT
                ? enrollments.findByStudentId(current.getId()).stream()
                        .map(e -> e.getCourse().getId()).collect(Collectors.toSet())
                : Set.of();
        return courses.findAll().stream()
                .map(c -> toResponse(c, enrolledIds.contains(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public CourseResponse findById(Long id, User current) {
        Course c = getCourse(id);
        boolean enrolled = current.getRole() == Role.STUDENT
                && enrollments.existsByStudentIdAndCourseId(current.getId(), id);
        return toResponse(c, enrolled);
    }

    @Transactional
    @Override
    public CourseResponse create(CourseRequest req, User current) {
        String code = req.code().trim().toUpperCase();
        if (courses.existsByCode(code)) {
            throw new ConflictException("A course with code " + code + " already exists");
        }
        Course c = new Course();
        apply(c, req, code);
        if (current.getRole() == Role.LECTURER) {
            c.setLecturer(current);
        } else {
            c.setLecturer(resolveLecturer(req.lecturerId()));
        }
        return toResponse(courses.save(c), false);
    }

    @Transactional
    @Override
    public CourseResponse update(Long id, CourseRequest req, User current) {
        Course c = getCourse(id);
        assertCanManage(c, current);

        String code = req.code().trim().toUpperCase();
        if (!code.equals(c.getCode()) && courses.existsByCode(code)) {
            throw new ConflictException("A course with code " + code + " already exists");
        }
        long enrolled = enrollments.countByCourseId(id);
        if (req.capacity() < enrolled) {
            throw new BadRequestException("Capacity cannot be lower than the " + enrolled + " students already enrolled");
        }
        apply(c, req, code);
        if (current.getRole() == Role.ADMIN && req.lecturerId() != null) {
            c.setLecturer(resolveLecturer(req.lecturerId()));
        }
        return toResponse(courses.save(c), false);
    }

    @Transactional
    @Override
    public void delete(Long id) {
        Course c = getCourse(id);
        enrollments.deleteByCourseId(id);
        courses.delete(c);
    }

    @Transactional(readOnly = true)
    @Override
    public List<EnrollmentResponse> students(Long courseId, User current) {
        Course c = getCourse(courseId);
        assertCanManage(c, current);
        return enrollments.findByCourseId(courseId).stream().map(EnrollmentResponse::from).toList();
    }

    // ---------- helpers ----------

    private Course getCourse(Long id) {
        return courses.findById(id).orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    /** ADMIN can manage everything; a LECTURER only their own courses. */
    private void assertCanManage(Course c, User current) {
        if (current.getRole() == Role.ADMIN) {
            return;
        }
        if (current.getRole() == Role.LECTURER && c.getLecturer() != null
                && c.getLecturer().getId().equals(current.getId())) {
            return;
        }
        throw new ForbiddenException("You can only manage your own courses");
    }

    private User resolveLecturer(Long lecturerId) {
        if (lecturerId == null) {
            return null;
        }
        User u = users.findById(lecturerId).orElseThrow(() -> new ResourceNotFoundException("Lecturer not found"));
        if (u.getRole() != Role.LECTURER) {
            throw new BadRequestException("Selected user is not a lecturer");
        }
        return u;
    }

    private void apply(Course c, CourseRequest req, String code) {
        c.setCode(code);
        c.setTitle(req.title().trim());
        c.setDescription(req.description());
        c.setCredits(req.credits());
        c.setCapacity(req.capacity());
    }

    private CourseResponse toResponse(Course c, boolean enrolled) {
        User l = c.getLecturer();
        return new CourseResponse(c.getId(), c.getCode(), c.getTitle(), c.getDescription(),
                c.getCredits(), c.getCapacity(), enrollments.countByCourseId(c.getId()),
                l != null ? l.getId() : null, l != null ? l.getFullName() : null, enrolled);
    }
}
