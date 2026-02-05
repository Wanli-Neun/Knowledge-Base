package com.kb.project.dto.response;

import java.time.Instant;
import java.util.UUID;

public record RecentDocumentResponse(
        UUID id,
        UUID projectId,
        String title,
        String fileType,
        long fileSize,
        Instant updatedAt) {
}
