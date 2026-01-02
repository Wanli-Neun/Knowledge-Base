package com.kb.auth.DTO.Request.Auth;

public record RegisterRequest(
    String email,
    String password
) {}
