package com.kb.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kb.auth.common.response.ApiResponse;
import com.kb.auth.dto.request.auth.LoginRequest;
import com.kb.auth.dto.request.auth.RefreshRequest;
import com.kb.auth.dto.request.auth.RegisterRequest;
import com.kb.auth.dto.response.auth.AuthResponse;
import com.kb.auth.service.AuthService;
import com.kb.auth.common.response.ApiResponseBuilder;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody RegisterRequest request) {

        authService.register(request.email(), request.password());

        return ApiResponseBuilder.created();
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request.email(), request.password());

        return ApiResponseBuilder.success("User logged in successfully", response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request.refreshToken());

        return ApiResponseBuilder.success("Token refreshed successfully", response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody RefreshRequest request) {

        authService.logout(request.refreshToken());

        return ApiResponseBuilder.noContent();
    }


}
