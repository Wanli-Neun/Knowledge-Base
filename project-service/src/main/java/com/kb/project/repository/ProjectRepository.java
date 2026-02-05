package com.kb.project.repository;

import com.kb.project.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

        boolean existsByIdAndIsActiveTrue(UUID id);

        Optional<Project> findByIdAndIsActiveTrue(UUID id);

        @Query("SELECT p FROM Member m JOIN Project p ON m.projectId = p.id " +
                        "WHERE m.userId = :userId AND m.isActive = true AND p.isActive = true")
        Page<Project> findProjectsByUserId(@Param("userId") UUID userId, Pageable pageable);

        @Query("SELECT p FROM Member m JOIN Project p ON m.projectId = p.id " +
                        "WHERE m.userId = :userId AND m.isActive = true AND p.isActive = true " +
                        "AND LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))")
        Page<Project> findProjectsByUserIdAndSearch(
                        @Param("userId") UUID userId,
                        @Param("search") String search,
                        Pageable pageable);

        long countByIsActiveTrue();

        long countByIsActiveFalse();

        long countByCreatedAtBetween(Instant start, Instant end);

        long countByIsActiveTrueAndCreatedAtBetween(Instant start, Instant end);

        long countByIsActiveFalseAndCreatedAtBetween(Instant start, Instant end);

        @Query("SELECT CAST(p.createdAt AS date) as date, COUNT(p) as count FROM Project p WHERE p.createdAt >= :startDate GROUP BY CAST(p.createdAt AS date) ORDER BY CAST(p.createdAt AS date)")
        List<Object[]> countProjectsByDateRange(@Param("startDate") Instant startDate);
}
