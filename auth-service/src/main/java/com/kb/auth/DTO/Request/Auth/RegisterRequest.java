package com.kb.auth.dto.request.auth;

public record RegisterRequest(
    String email,
    String password
) {}
