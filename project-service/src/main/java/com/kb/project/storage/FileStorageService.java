package com.kb.project.storage;

import java.io.InputStream;

import java.time.Duration;

public interface FileStorageService {
    void upload(
        String key,
        InputStream inputStream,
        long contentLength,
        String contentType
    );

    void delete(String key);

    String generateDownloadUrl(String key, Duration expiresIn);
}
