package com.kb.project.repository;

import com.kb.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    boolean existsByIdAndIsActiveTrue(UUID id);

    Optional<Project> findByIdAndIsActiveTrue(UUID id);
}
