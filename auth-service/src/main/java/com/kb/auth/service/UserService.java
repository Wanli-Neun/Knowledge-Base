package com.kb.auth.service;

import org.springframework.stereotype.Service;

import com.kb.auth.repository.UserRepository;
import com.kb.auth.dto.response.user.UserResponse;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponse> findAllUsers(){
        return userRepository.findAll()
            .stream()
            .map(user -> UserResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .build()
            )
            .collect(Collectors.toList());
    }
}
