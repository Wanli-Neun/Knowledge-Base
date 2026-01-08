package com.kb.project.client.auth;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.kb.project.dto.client.auth.UserInternalResponse;

import java.util.UUID;


@FeignClient(
    name = "auth-service",
    url = "${clients.auth-service.url}"
)
public interface AuthUserClient {
    
    @GetMapping("/internal/users/{userId}")
    UserInternalResponse getUserById(@PathVariable UUID userId);

}
