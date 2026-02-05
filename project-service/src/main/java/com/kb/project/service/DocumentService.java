package com.kb.project.service;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import java.time.Duration;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import com.kb.project.dto.response.TimeSeriesDataPoint;
import com.kb.project.storage.FileStorageService;
import com.kb.project.repository.DocumentRepository;
import com.kb.project.repository.MemberRepository;
import com.kb.project.entity.Document;
import com.kb.project.service.MemberService;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final FileStorageService fileStorageService;
    private final DocumentRepository documentRepository;
    private final MemberRepository memberRepository;
    private final MemberService memberService;

    @Transactional
    public Document upload(
            UUID projectId,
            UUID userId,
            MultipartFile file) throws IOException {

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check if user is member of project
        boolean isMember = memberRepository
                .existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);
        if (!isMember) {
            throw new SecurityException("You do not have permission to upload to this project");
        }

        // Validate file size (50MB max)
        long maxSize = 50 * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size (50MB)");
        }

        String extension = getExtension(file.getOriginalFilename());
        String key = "documents/" + UUID.randomUUID() + extension;
        String contentType = Optional
                .ofNullable(file.getContentType())
                .orElse("application/octet-stream");

        try {
            fileStorageService.upload(
                    key,
                    file.getInputStream(),
                    file.getSize(),
                    contentType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }

        Document document = Document.builder()
                .projectId(projectId)
                .title(file.getOriginalFilename())
                .filePath(key)
                .fileType(contentType)
                .fileSize(file.getSize())
                .uploadedBy(userId)
                .updatedBy(userId)
                .build();

        return documentRepository.save(document);

    }

    @Transactional
    public void delete(UUID projectId, UUID documentId, UUID userId) {

        Document document = documentRepository
                .findByIdAndProjectIdAndIsActiveTrue(documentId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (!document.getUploadedBy().equals(userId)) {
            throw new SecurityException("You do not have permission to delete this document");
        }

        // Delete file from S3
        try {
            fileStorageService.delete(document.getFilePath());
        } catch (Exception e) {
            // Log error but continue with soft delete
            System.err.println("Failed to delete file from S3: " + e.getMessage());
        }

        // Soft delete in database
        document.deactivate(userId);
    }

    @Transactional(readOnly = true)
    public String generateDownloadUrl(UUID projectId, UUID documentId, UUID userId, Duration expiresIn) {
        Document document = documentRepository
                .findByIdAndProjectIdAndIsActiveTrue(documentId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        boolean isMember = memberRepository
                .existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);

        if (!isMember) {
            throw new SecurityException("You do not have permission to access this document");
        }

        return fileStorageService.generateDownloadUrl(document.getFilePath(), expiresIn, document.getTitle());
    }

    @Transactional(readOnly = true)
    public Page<Document> getDocumentsbyProject(
            UUID projectId,
            UUID userId,
            String search,
            Pageable pageable) {
        boolean isMember = memberRepository
                .existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);

        if (!isMember) {
            throw new SecurityException("You do not have permission to access these documents");
        }

        if (search != null && !search.trim().isEmpty()) {
            return documentRepository.findByProjectIdAndTitleContainingIgnoreCaseAndIsActiveTrue(
                    projectId, search.trim(), pageable);
        }

        return documentRepository.findByProjectIdAndIsActiveTrue(projectId, pageable);
    }

    public Document getDocumentById(UUID projectId, UUID documentId, UUID userId) {
        Document document = documentRepository
                .findByIdAndProjectIdAndIsActiveTrue(documentId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        boolean isMember = memberRepository
                .existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);

        if (!isMember) {
            throw new SecurityException("You do not have permission to access this document");
        }

        return document;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    public String getUploaderDisplayName(UUID userId) {
        try {
            return memberService.getUserInfo(userId).getDisplayName();
        } catch (Exception e) {
            return "Unknown User";
        }
    }

    public Page<Document> getAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable);
    }

    public long getTotalDocuments() {
        return documentRepository.count();
    }

    public long getTotalDocuments(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getTotalDocuments();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return documentRepository.countByUploadedAtBetween(start, end);
    }

    public long getActiveDocuments() {
        return documentRepository.countByIsActiveTrue();
    }

    public long getActiveDocuments(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getActiveDocuments();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return documentRepository.countByIsActiveTrueAndUploadedAtBetween(start, end);
    }

    public long getInactiveDocuments() {
        return documentRepository.countByIsActiveFalse();
    }

    public long getInactiveDocuments(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getInactiveDocuments();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return documentRepository.countByIsActiveFalseAndUploadedAtBetween(start, end);
    }

    public List<TimeSeriesDataPoint> getDocumentTimeSeries(int days) {
        return getDocumentTimeSeries(days, null, null);
    }

    public List<TimeSeriesDataPoint> getDocumentTimeSeries(int days, String startDateStr, String endDateStr) {
        LocalDate start;
        LocalDate end;

        if (startDateStr != null && endDateStr != null) {
            start = LocalDate.parse(startDateStr);
            end = LocalDate.parse(endDateStr);
        } else if (startDateStr != null) {
            start = LocalDate.parse(startDateStr);
            end = LocalDate.now();
        } else if (endDateStr != null) {
            end = LocalDate.parse(endDateStr);
            start = end.minusDays(days - 1);
        } else {
            end = LocalDate.now();
            start = end.minusDays(days - 1);
        }

        Instant startInstant = start.atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
        List<Object[]> results = documentRepository.countDocumentsByDateRange(startInstant);

        // Convert to map for easy lookup
        Map<LocalDate, Long> dataMap = results.stream()
                .collect(Collectors.toMap(
                        row -> {
                            if (row[0] instanceof java.sql.Date) {
                                return ((java.sql.Date) row[0]).toLocalDate();
                            } else if (row[0] instanceof LocalDate) {
                                return (LocalDate) row[0];
                            }
                            return LocalDate.parse(row[0].toString());
                        },
                        row -> ((Number) row[1]).longValue()));

        // Fill in all dates in range
        List<TimeSeriesDataPoint> timeSeries = new ArrayList<>();
        LocalDate currentDate = start;

        while (!currentDate.isAfter(end)) {
            long count = dataMap.getOrDefault(currentDate, 0L);
            timeSeries.add(TimeSeriesDataPoint.builder()
                    .date(currentDate.toString())
                    .count(count)
                    .build());
            currentDate = currentDate.plusDays(1);
        }

        return timeSeries;
    }

    @Transactional(readOnly = true)
    public long countUserDocuments(UUID userId) {
        return documentRepository.countByUserDocuments(userId);
    }

    @Transactional(readOnly = true)
    public Page<Document> getRecentUserDocuments(UUID userId, Pageable pageable) {
        return documentRepository.findRecentDocumentsByUserId(userId, pageable);
    }
}
