package com.kb.project.security;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CustomUserPrincipal {
    
    private UUID userId;
    private String role;
    private String email;
}
