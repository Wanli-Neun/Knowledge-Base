package com.kb.auth.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kb.auth.common.response.ApiResponse;
import com.kb.auth.dto.response.user.UserResponse;
import com.kb.auth.security.CustomUserPrincipal;
import com.kb.auth.service.UserService;
import com.kb.auth.entity.User;
import com.kb.auth.mapper.UserMapper;
import com.kb.auth.common.response.ApiResponseBuilder;
import com.kb.auth.dto.request.user.UpdateProfileRequest;

import org.springframework.security.core.Authentication;

import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {


    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(Pageable pageable) {

        Page<User> users = userService.findAllUsers(pageable);

        Page<UserResponse> response = users.map(UserMapper::toResponse);

        return ApiResponseBuilder.success("Get all users successfully", response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
        Authentication authentication
    ) {

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        UUID userId = principal.getUserId();

        User user = userService.getUserById(userId);

        return ApiResponseBuilder.success("Get profile successfully", UserMapper.toResponse(user));
    }


    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
        @RequestBody UpdateProfileRequest request,
        Authentication authentication
    ) {

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        UUID userId = principal.getUserId();

        User updatedUser = userService.updateProfile(userId, request);

        return ApiResponseBuilder.success("Profile updated successfully", UserMapper.toResponse(updatedUser));
    }
    
}
