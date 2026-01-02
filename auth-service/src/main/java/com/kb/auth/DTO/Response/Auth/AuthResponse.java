package com.kb.auth.DTO.Response.Auth;

public record AuthResponse (
    String accessToken,
    String refreshToken
) {}
