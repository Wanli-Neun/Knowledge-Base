package com.kb.project.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "documents",
    indexes = {
        @Index(
            name = "idx_documents_project_id",
            columnList = "projectId"
        )
    }

)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID projectId;

    private String title;

    private String filePath;

    private String fileType;

    private long fileSize;

    @Column(nullable = false)
    private UUID uploadedBy;

    @Column(nullable = false)
    private Instant uploadedAt;

    @Column(nullable = false)
    private UUID updatedBy;

    @Column(nullable = false)
    private Instant updatedAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    @PrePersist
    public void onCreate(){
        Instant now = Instant.now();
        this.uploadedAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate(){
        this.updatedAt = Instant.now();
    }
}
