package com.kb.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kb.auth.repository.RefreshTokenRepository;
import com.kb.auth.repository.UserRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.kb.auth.DTO.Response.Auth.AuthResponse;
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

    public AuthService( JwtService jwtService, PasswordEncoder passwordEncoder, RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public void register(String email, String password) {

        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Email already exists");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .build();

        userRepository.save(user);
    }

    public AuthResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive()) {
            throw new IllegalStateException("User is disabled");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        RefreshToken refreshToken = createRefreshToken(user);

        String accessToken = jwtService.generateAccessToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    public AuthResponse refresh(String refreshTokenValue) {

        RefreshToken oldToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (!oldToken.isActive()) {
            throw new IllegalStateException("Refresh token expired or revoked");
        }

        oldToken.setRevoked(true);

        RefreshToken newToken = createRefreshToken(oldToken.getUser());

        String newAccessToken = jwtService.generateAccessToken(oldToken.getUser());

        return new AuthResponse(newAccessToken, newToken.getToken());
    }

    public void logout(String refreshTokenValue) {
        refreshTokenRepository.revokeByToken(refreshTokenValue);
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
