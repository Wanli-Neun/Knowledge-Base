package com.kb.auth.dto.request.user;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    
    private String fullName;
    private String displayName;
    private String avaUrl;
}
