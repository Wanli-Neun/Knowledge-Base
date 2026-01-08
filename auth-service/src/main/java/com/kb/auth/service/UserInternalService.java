package com.kb.auth.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.kb.auth.repository.UserRepository;
import com.kb.auth.dto.response.user.UserInternalResponse;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserInternalService {

    private final UserRepository userRepository;

    public UserInternalResponse getUserById(UUID userId) {
        var user = userRepository.findByIdAndActiveTrue(userId)
            .orElseThrow(() -> new IllegalStateException("[AuthService:UserInternal] User not found"));

        return UserInternalResponse.builder()
            .id(user.getId())
            .displayName(user.getDisplayName())
            .email(user.getEmail())
            .build();
    }

}
