package com.sms.service.impl;

import com.sms.service.AuthService;

import com.sms.dto.AuthResponse;
import com.sms.dto.LoginRequest;
import com.sms.dto.RegisterRequest;
import com.sms.dto.UserResponse;
import com.sms.entity.Role;
import com.sms.entity.User;
import com.sms.exception.BadRequestException;
import com.sms.exception.ConflictException;
import com.sms.repository.UserRepository;
import com.sms.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthServiceImpl(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Override
    public AuthResponse register(RegisterRequest req) {
        Role role = req.role() == null ? Role.STUDENT : req.role();
        if (role == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be created through registration");
        }
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setRole(role);
        u = users.save(u);
        return new AuthResponse(jwt.generateToken(u), UserResponse.from(u));
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmail(req.email().trim().toLowerCase())
                .filter(found -> encoder.matches(req.password(), found.getPassword()))
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        return new AuthResponse(jwt.generateToken(u), UserResponse.from(u));
    }
}
