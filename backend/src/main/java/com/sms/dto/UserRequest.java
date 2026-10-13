package com.sms.dto;

import com.sms.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Used by ADMIN to create / update users. Password is optional on update. */
public record UserRequest(
        @NotBlank(message = "Full name is required") String fullName,
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
        String password,
        @NotNull(message = "Role is required") Role role) {
}
