package com.kb.project.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.kb.project.entity.Document;
import java.util.UUID;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    Page<Document> findByProjectIdAndIsActiveTrue(UUID projectId, Pageable pageable);
    
    Page<Document> findByProjectIdAndUploadedByAndIsActiveTrue(UUID projectId, UUID uploadedBy, Pageable pageable);

    Optional<Document> findByIdAndProjectIdAndIsActiveTrue(UUID documentId, UUID projectId);
}
