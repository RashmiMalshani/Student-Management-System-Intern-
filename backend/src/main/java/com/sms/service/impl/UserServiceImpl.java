package com.sms.service.impl;

import com.sms.service.UserService;

import com.sms.dto.UserRequest;
import com.sms.dto.UserResponse;
import com.sms.entity.Role;
import com.sms.entity.User;
import com.sms.exception.BadRequestException;
import com.sms.exception.ConflictException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.EnrollmentRepository;
import com.sms.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository users;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final PasswordEncoder encoder;

    public UserServiceImpl(UserRepository users, CourseRepository courses,
                       EnrollmentRepository enrollments, PasswordEncoder encoder) {
        this.users = users;
        this.courses = courses;
        this.enrollments = enrollments;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    @Override
    public List<UserResponse> findAll(Role role) {
        List<User> list = role == null ? users.findAll() : users.findByRole(role);
        return list.stream().map(UserResponse::from).toList();
    }

    @Transactional
    @Override
    public UserResponse create(UserRequest req) {
        if (req.password() == null || req.password().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setRole(req.role());
        return UserResponse.from(users.save(u));
    }

    @Transactional
    @Override
    public UserResponse update(Long id, UserRequest req) {
        User u = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String email = req.email().trim().toLowerCase();
        if (!email.equals(u.getEmail()) && users.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setRole(req.role());
        if (req.password() != null && !req.password().isBlank()) {
            if (req.password().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters");
            }
            u.setPassword(encoder.encode(req.password()));
        }
        return UserResponse.from(users.save(u));
    }

    @Transactional
    @Override
    public void delete(Long id, User current) {
        if (current.getId().equals(id)) {
            throw new BadRequestException("You cannot delete your own account");
        }
        User u = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (courses.existsByLecturerId(id)) {
            throw new ConflictException("This lecturer still has courses. Reassign or delete them first");
        }
        enrollments.deleteByStudentId(id);
        users.delete(u);
    }
}
