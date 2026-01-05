package com.kb.auth.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.kb.auth.repository.UserRepository;
import com.kb.auth.dto.request.user.UpdateProfileRequest;
import com.kb.auth.dto.response.user.UserResponse;
import com.kb.auth.entity.User;

import java.util.UUID;

import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Page<UserResponse> findAllUsers(Pageable pageable) {
        
        return userRepository.findAll(pageable)
            .map(user -> UserResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .displayName(user.getDisplayName())
                .avaUrl(user.getAvaUrl())
                .build()
            );
    }

    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String fullName = request.getFullName();
        String displayName = request.getDisplayName();
        String avaUrl = request.getAvaUrl();

        if (fullName != null) {
            user.setFullName(fullName);
        }

        if (displayName != null) {
            user.setDisplayName(displayName);
        }

        if (avaUrl != null) {
            user.setAvaUrl(avaUrl);
        }

        User updatedUser = userRepository.save(user);

        return UserResponse.builder()
            .email(updatedUser.getEmail())
            .fullName(updatedUser.getFullName())
            .displayName(updatedUser.getDisplayName())
            .avaUrl(updatedUser.getAvaUrl())
            .build();
    }
}
