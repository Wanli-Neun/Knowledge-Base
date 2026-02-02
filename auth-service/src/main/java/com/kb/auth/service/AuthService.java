package com.kb.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kb.auth.repository.RefreshTokenRepository;
import com.kb.auth.repository.UserRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.kb.auth.common.ApiException;
import com.kb.auth.dto.request.auth.ChangePasswordRequest;
import com.kb.auth.dto.response.auth.AuthResponse;
import com.kb.auth.entity.RefreshToken;
import com.kb.auth.entity.User;

import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public AuthService(JwtService jwtService, PasswordEncoder passwordEncoder,
            RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public void register(String email, String password, String fullName, String displayName) {

        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("Email already exists");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .displayName(displayName)
                .build();

        userRepository.save(user);
    }

    public AuthResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid credentials"));

        if (!user.isActive()) {
            throw ApiException.forbidden("User is disabled");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw ApiException.unauthorized("Invalid credentials");
        }

        RefreshToken refreshToken = createRefreshToken(user);

        String accessToken = jwtService.generateAccessToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    public AuthResponse refresh(String refreshTokenValue) {

        System.out.println("=== Refresh Token Request ===");
        System.out.println("Refresh token value: " + refreshTokenValue);

        RefreshToken oldToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> {
                    System.out.println("Refresh token not found in database");
                    return ApiException.unauthorized("Invalid refresh token");
                });

        System.out.println("Refresh token found. User ID: " + oldToken.getUser().getId());
        System.out.println("Token is revoked: " + oldToken.isRevoked());
        System.out.println("Token is expired: " + oldToken.isExpired());
        System.out.println("Token is active: " + oldToken.isActive());
        System.out.println("Token expires at: " + oldToken.getExpiresAt());
        System.out.println("Current time: " + java.time.Instant.now());

        if (!oldToken.isActive()) {
            System.out.println("Refresh token is not active (expired or revoked)");
            throw ApiException.unauthorized("Refresh token expired or revoked");
        }

        System.out.println("Revoking old token...");
        oldToken.revoked();
        refreshTokenRepository.save(oldToken); // IMPORTANT: Save to persist revoke status

        System.out.println("Creating new refresh token...");
        RefreshToken newToken = createRefreshToken(oldToken.getUser());

        System.out.println("Generating new access token...");
        String newAccessToken = jwtService.generateAccessToken(oldToken.getUser());

        System.out.println("Refresh successful!");
        return new AuthResponse(newAccessToken, newToken.getToken());
    }

    public void logout(String refreshTokenValue) {
        refreshTokenRepository.revokeByToken(refreshTokenValue);
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw ApiException.badRequest("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw ApiException.badRequest("New password and confirmation do not match");
        }

        user.changePassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }

    private RefreshToken createRefreshToken(User user) {

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(Instant.now().plus(10, ChronoUnit.DAYS))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }
}
