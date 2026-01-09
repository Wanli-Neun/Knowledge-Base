package com.kb.project.storage.impl;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import com.kb.project.storage.S3Properties;
import com.kb.project.storage.FileStorageService;

import java.io.InputStream;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    @Override
    public void upload(
        String key,
        InputStream inputStream,
        long contentLength,
        String contentType
    ) {
        String fullKey = buildKey(key);

        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(s3Properties.bucket())
            .key(fullKey)
            .contentType(contentType)
            .contentLength(contentLength)
            .build();

        s3Client.putObject(
            request,
            RequestBody.fromInputStream(inputStream, contentLength)
        );

    }

    @Override
    public void delete(String key) {
        String fullKey = buildKey(key);

        DeleteObjectRequest request = DeleteObjectRequest.builder()
            .bucket(s3Properties.bucket())
            .key(fullKey)
            .build();

        s3Client.deleteObject(request);
    }

    @Override
    public String generateDownloadUrl(String key, Duration expiresIn) {
        String fullKey = buildKey(key);

        try (S3Presigner presigner = S3Presigner.create()) {

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(fullKey)
                .build();

            GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                    .signatureDuration(expiresIn)
                    .getObjectRequest(getObjectRequest)
                    .build();

            return presigner
                .presignGetObject(presignRequest)
                .url()
                .toString();
        }
    }

    private String buildKey(String key) {
        if (s3Properties.prefix() == null || s3Properties.prefix().isBlank()) {
            return key;
        }
        return s3Properties.prefix() + "/" + key;
    }
}
