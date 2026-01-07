package com.kb.project.repository;

import com.kb.project.entity.Member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;


public interface MemberRepository extends JpaRepository<Member, UUID> {

    boolean existsByProjectIdAndUserIdAndIsActiveTrue(UUID projectId, UUID userId);

    Page<Member> findByProjectIdAndIsActiveTrue(UUID projectId, Pageable pageable);

    Page<Member> findByUserIdAndIsActiveTrue(UUID userId, Pageable pageable);

}
