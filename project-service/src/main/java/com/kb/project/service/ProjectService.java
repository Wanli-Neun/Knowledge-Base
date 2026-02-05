package com.kb.project.service;

import com.kb.project.dto.client.auth.UserInternalResponse;
import com.kb.project.dto.request.project.CreateProjectRequest;
import com.kb.project.dto.request.project.UpdateProjectRequest;
import com.kb.project.dto.response.TimeSeriesDataPoint;
import com.kb.project.repository.MemberRepository;
import com.kb.project.repository.ProjectRepository;
import com.kb.project.entity.Project;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final MemberService memberService;

    @Transactional(readOnly = true)
    public Page<Project> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Project> getProjectsByUserId(UUID userId, String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return projectRepository.findProjectsByUserIdAndSearch(userId, search.trim(), pageable);
        }
        return projectRepository.findProjectsByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Project getProject(UUID projectId, UUID userId) {

        boolean isMember = memberRepository.existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);

        if (!isMember) {
            throw new RuntimeException("Access denied: User is not a member of the project");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return project;
    }

    public String getCreatorDisplayName(UUID userId) {
        UserInternalResponse userInfo = memberService.getUserInfo(userId);
        return userInfo.getDisplayName();
    }

    @Transactional
    public Project createProject(CreateProjectRequest request, UUID userId) {
        Project project = Project.builder()
                .name(request.projectName())
                .description(request.description())
                .createdBy(userId)
                .updatedBy(userId)
                .build();

        projectRepository.save(project);

        UserInternalResponse userInfo = memberService.getUserInfo(userId);
        String displayName = userInfo.getDisplayName();

        memberService.addMemberInternal(
                project.getId(),
                userId,
                userId,
                displayName);

        return project;
    }

    @Transactional
    public void updateProject(UpdateProjectRequest request, UUID userId, UUID projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.updateDetails(
                request.projectName(),
                request.description(),
                userId);

    }

    @Transactional
    public void deactivate(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.deactivate(userId);
    }

    public long getTotalProjects() {
        return projectRepository.count();
    }

    public long getTotalProjects(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getTotalProjects();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return projectRepository.countByCreatedAtBetween(start, end);
    }

    public long getActiveProjects() {
        return projectRepository.countByIsActiveTrue();
    }

    public long getActiveProjects(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getActiveProjects();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return projectRepository.countByIsActiveTrueAndCreatedAtBetween(start, end);
    }

    public long getInactiveProjects() {
        return projectRepository.countByIsActiveFalse();
    }

    public long getInactiveProjects(String startDate, String endDate) {
        if (startDate == null && endDate == null) {
            return getInactiveProjects();
        }
        Instant start = startDate != null
                ? LocalDate.parse(startDate).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.EPOCH;
        Instant end = endDate != null
                ? LocalDate.parse(endDate).plusDays(1).atStartOfDay(java.time.ZoneOffset.UTC).toInstant()
                : Instant.now();
        return projectRepository.countByIsActiveFalseAndCreatedAtBetween(start, end);
    }

    public List<TimeSeriesDataPoint> getProjectTimeSeries(int days) {
        return getProjectTimeSeries(days, null, null);
    }

    public List<TimeSeriesDataPoint> getProjectTimeSeries(int days, String startDateStr, String endDateStr) {
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
        List<Object[]> results = projectRepository.countProjectsByDateRange(startInstant);

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

    @Transactional(readOnly = true)
    public long countUserProjects(UUID userId) {
        return projectRepository.countByMemberUserId(userId);
    }

}
