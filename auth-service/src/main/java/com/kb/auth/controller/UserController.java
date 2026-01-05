package com.kb.auth.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kb.auth.common.response.ApiResponse;
import com.kb.auth.dto.response.user.UserResponse;
import com.kb.auth.service.UserService;


import com.kb.auth.common.response.ApiResponseBuilder;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {


    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(Pageable pageable) {

        Page<UserResponse> users = userService.findAllUsers(pageable);

        return ApiResponseBuilder.success("Get all users successfully", users);
    }
}
