package com.kb.auth.DTO.Request.Auth;

public record LoginRequest(
    String email,
    String password
) {}
