package com.kb.project.repository;

import com.kb.project.entity.Member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID> {

    boolean existsByProjectIdAndUserIdAndIsActiveTrue(UUID projectId, UUID userId);

    Page<Member> findByProjectIdAndIsActiveTrue(UUID projectId, Pageable pageable);

    @Query("SELECT m FROM Member m WHERE m.projectId = :projectId " +
            "AND m.isActive = true " +
            "AND LOWER(m.displayName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Member> findByProjectIdAndSearchAndIsActiveTrue(
            @Param("projectId") UUID projectId,
            @Param("search") String search,
            Pageable pageable);

    Page<Member> findByUserIdAndIsActiveTrue(UUID userId, Pageable pageable);

    Optional<Member> findByProjectIdAndUserIdAndIsActiveTrue(UUID projectId, UUID userId);

    Optional<Member> findByProjectIdAndUserId(UUID projectId, UUID userId);

}
