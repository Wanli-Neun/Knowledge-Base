package com.kb.project.dto.response;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentResponse {
    
    private UUID id;
    private UUID projectId;
    private String title;
    private String fileType;
    private long fileSize;
    private String downloadUrl;
}
