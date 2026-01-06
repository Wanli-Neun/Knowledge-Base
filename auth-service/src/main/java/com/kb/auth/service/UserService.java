package com.kb.auth.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            .map(user -> toUserResponse(user));
    }

    public UserResponse getUserById(UUID userId) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String fullName = request.getFullName();
        String displayName = request.getDisplayName();
        String avaUrl = request.getAvaUrl();

        user.updateProfile(fullName, displayName, avaUrl);

        User updatedUser = userRepository.save(user);

        return toUserResponse(updatedUser);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
            .email(user.getEmail())
            .fullName(user.getFullName())
            .displayName(user.getDisplayName())
            .avaUrl(user.getAvaUrl())
            .build();
    }

}
