package com.kb.project.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Entity
@Table(
    name = "members",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"projectId", "userId"})
    },
    indexes = {
        @Index(
            name = "idx_members_project_id",
            columnList = "projectId"
        ),
        @Index(
            name = "idx_members_user_id",
            columnList = "userId"
        )
    }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private UUID userId;

    private String displayName;

    @Column(nullable = false, updatable = false)
    private UUID addedBy;

    @Column(nullable = false, updatable = false)
    private Instant addedAt;

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
        this.addedAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate(){
        this.updatedAt = Instant.now();
    }

}
