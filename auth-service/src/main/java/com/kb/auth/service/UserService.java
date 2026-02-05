package com.kb.auth.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kb.auth.repository.UserRepository;
import com.kb.auth.dto.request.user.UpdateProfileRequest;
import com.kb.auth.dto.request.auth.ChangePasswordRequest;
import com.kb.auth.dto.response.TimeSeriesDataPoint;
import com.kb.auth.entity.User;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<User> findAllUsers(Pageable pageable) {

        return userRepository.findAll(pageable);
    }

    public User getUserById(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user;
    }

    @Transactional
    public User updateProfile(UUID userId, UpdateProfileRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fullName = request.getFullName();
        String displayName = request.getDisplayName();
        String avaUrl = request.getAvaUrl();

        user.updateProfile(fullName, displayName, avaUrl);

        User updatedUser = userRepository.save(user);

        return updatedUser;
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Verify new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        // Encode and save new password
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        user.changePassword(encodedPassword);

        userRepository.save(user);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getTotalUsers(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getTotalUsers();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return userRepository.countByCreatedAtBetween(start, end);
    }

    public long getActiveUsers() {
        return userRepository.countByActiveTrue();
    }

    public long getActiveUsers(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getActiveUsers();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return userRepository.countByActiveTrueAndCreatedAtBetween(start, end);
    }

    public long getInactiveUsers() {
        return userRepository.countByActiveFalse();
    }

    public long getInactiveUsers(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getInactiveUsers();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return userRepository.countByActiveFalseAndCreatedAtBetween(start, end);
    }

    public List<TimeSeriesDataPoint> getUserTimeSeries(int days) {
        return getUserTimeSeries(days, null, null);
    }

    public List<TimeSeriesDataPoint> getUserTimeSeries(int days, String startDateStr, String endDateStr) {
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
        List<Object[]> results = userRepository.countUsersByDateRange(startInstant);

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

}
