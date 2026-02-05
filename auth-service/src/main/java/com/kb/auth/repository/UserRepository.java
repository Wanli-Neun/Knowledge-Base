package com.kb.auth.repository;

import com.kb.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByIdAndActiveTrue(UUID id);

    boolean existsByEmail(String email);

    long countByActiveTrue();

    long countByActiveFalse();

    long countByCreatedAtBetween(Instant start, Instant end);

    long countByActiveTrueAndCreatedAtBetween(Instant start, Instant end);

    long countByActiveFalseAndCreatedAtBetween(Instant start, Instant end);

    @Query("SELECT CAST(u.createdAt AS date) as date, COUNT(u) as count FROM User u WHERE u.createdAt >= :startDate GROUP BY CAST(u.createdAt AS date) ORDER BY CAST(u.createdAt AS date)")
    List<Object[]> countUsersByDateRange(@Param("startDate") Instant startDate);
}
