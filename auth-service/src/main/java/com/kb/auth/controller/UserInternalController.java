package com.kb.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.kb.auth.service.UserInternalService;
import com.kb.auth.dto.response.user.UserInternalResponse;

import lombok.RequiredArgsConstructor;

import java.util.UUID;


@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/users")
public class UserInternalController {

    private final UserInternalService userInternalService;

    @GetMapping("/{userId}")
    public UserInternalResponse getUserById(@PathVariable UUID userId) {

        return userInternalService.getUserById(userId);
    }

}
