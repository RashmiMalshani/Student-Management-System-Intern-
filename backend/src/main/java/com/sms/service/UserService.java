package com.sms.service;

import com.sms.dto.UserRequest;
import com.sms.dto.UserResponse;
import com.sms.entity.Role;
import com.sms.entity.User;

import java.util.List;

public interface UserService {
    List<UserResponse> findAll(Role role);
    UserResponse create(UserRequest request);
    UserResponse update(Long id, UserRequest request);
    void delete(Long id, User current);
}
