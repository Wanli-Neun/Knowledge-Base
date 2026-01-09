package com.kb.project.mapper;

import com.kb.project.dto.response.DocumentResponse;
import com.kb.project.dto.response.DocumentResponse.DocumentResponseBuilder;
import com.kb.project.entity.Document;

public final class DocumentMapper {

    private DocumentMapper() {}

    private static final DocumentResponseBuilder baseBuilder(Document document) {
        return DocumentResponse.builder()
            .id(document.getId())
            .projectId(document.getProjectId())
            .title(document.getTitle())
            .fileType(document.getFileType())
            .fileSize(document.getFileSize());
    }

    public static DocumentResponse toResponse(Document document, String downloadUrl) {
        return baseBuilder(document)
            .downloadUrl(downloadUrl)
            .build();
    }

    public static DocumentResponse toResponse(Document document) {
        return baseBuilder(document)
            .build();
    }




}
