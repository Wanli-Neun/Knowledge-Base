package com.kb.auth.mapper;

import com.kb.auth.dto.response.user.UserResponse;
import com.kb.auth.entity.User;

public class UserMapper {
    
    private UserMapper() {}

    public static UserResponse toResponse(User user){
        return UserResponse.builder()
            .email(user.getEmail())
            .fullName(user.getFullName())
            .displayName(user.getDisplayName())
            .avaUrl(user.getAvaUrl())
            .build();
    }
}
