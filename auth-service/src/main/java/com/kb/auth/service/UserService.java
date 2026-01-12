package com.kb.auth.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kb.auth.repository.UserRepository;
import com.kb.auth.dto.request.user.UpdateProfileRequest;
import com.kb.auth.entity.User;

import java.util.UUID;

import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Page<User> findAllUsers(Pageable pageable) {
        
        return userRepository.findAll(pageable);
    }

    public User getUserById(UUID userId) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return user;
    }

    @Transactional
    public User updateProfile(UUID userId, UpdateProfileRequest request) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String fullName = request.getFullName();
        String displayName = request.getDisplayName();
        String avaUrl = request.getAvaUrl();

        user.updateProfile(fullName, displayName, avaUrl);

        User updatedUser = userRepository.save(user);

        return updatedUser;
    }

}
