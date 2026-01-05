package com.kb.auth.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.kb.auth.repository.UserRepository;
import com.kb.auth.dto.response.user.UserResponse;

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
}
