package com.kb.project.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.kb.project.entity.Document;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    Page<Document> findByProjectIdAndIsActiveTrue(UUID projectId, Pageable pageable);

    Page<Document> findByProjectIdAndTitleContainingIgnoreCaseAndIsActiveTrue(UUID projectId, String title,
            Pageable pageable);

    Page<Document> findByProjectIdAndUploadedByAndIsActiveTrue(UUID projectId, UUID uploadedBy, Pageable pageable);

    Optional<Document> findByIdAndProjectIdAndIsActiveTrue(UUID documentId, UUID projectId);

    Page<Document> findByIsActiveTrue(Pageable pageable);

    long countByIsActiveTrue();

    long countByIsActiveFalse();

    long countByUploadedAtBetween(Instant start, Instant end);

    long countByIsActiveTrueAndUploadedAtBetween(Instant start, Instant end);

    long countByIsActiveFalseAndUploadedAtBetween(Instant start, Instant end);

    // Admin methods - get all documents including inactive
    Page<Document> findAll(Pageable pageable);

    long count();

    @Query("SELECT CAST(d.uploadedAt AS date) as date, COUNT(d) as count FROM Document d WHERE d.uploadedAt >= :startDate GROUP BY CAST(d.uploadedAt AS date) ORDER BY CAST(d.uploadedAt AS date)")
    List<Object[]> countDocumentsByDateRange(@Param("startDate") Instant startDate);
}
