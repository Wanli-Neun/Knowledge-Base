package com.kb.auth.dto.response.auth;

public record AuthResponse (
    String accessToken,
    String refreshToken
) {}
