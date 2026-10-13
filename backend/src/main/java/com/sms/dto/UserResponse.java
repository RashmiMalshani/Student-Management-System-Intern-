package com.sms.dto;

import com.sms.entity.Role;
import com.sms.entity.User;

public record UserResponse(Long id, String fullName, String email, Role role) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole());
    }
}
