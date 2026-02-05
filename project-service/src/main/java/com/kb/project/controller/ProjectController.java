package com.kb.project.controller;

import com.kb.project.common.response.ApiResponse;
import com.kb.project.common.response.ApiResponseBuilder;
import com.kb.project.dto.request.project.CreateProjectRequest;
import com.kb.project.dto.request.project.UpdateProjectRequest;
import com.kb.project.dto.response.ProjectResponse;
import com.kb.project.dto.response.UserStatsResponse;
import com.kb.project.dto.response.RecentDocumentResponse;
import com.kb.project.mapper.ProjectMapper;
import com.kb.project.entity.Project;
import com.kb.project.entity.Document;
import com.kb.project.security.CustomUserPrincipal;
import com.kb.project.service.ProjectService;
import com.kb.project.service.DocumentService;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final DocumentService documentService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(Pageable pageable) {
        Page<Project> projects = projectService.getAllProjects(pageable);

        Page<ProjectResponse> response = projects.map(ProjectMapper::toResponse);

        return ApiResponseBuilder.success("Get all projects successfully", response);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getMyProjects(
            @RequestParam(required = false) String search,
            Pageable pageable,
            Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Page<Project> projects = projectService.getProjectsByUserId(principal.getUserId(), search, pageable);

        Page<ProjectResponse> response = projects.map(project -> {
            String creatorDisplayName = projectService.getCreatorDisplayName(project.getCreatedBy());
            return ProjectMapper.toResponse(project, creatorDisplayName);
        });

        return ApiResponseBuilder.success("Get my projects successfully", response);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        CustomUserPrincipal userPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
        Project project = projectService.createProject(request, userPrincipal.getUserId());

        return ApiResponseBuilder.created("Project created successfully", ProjectMapper.toResponse(project));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable UUID projectId,
            Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Project project = projectService.getProject(projectId, principal.getUserId());
        String creatorDisplayName = projectService.getCreatorDisplayName(project.getCreatedBy());

        return ApiResponseBuilder.success("Get project successfully",
                ProjectMapper.toResponse(project, creatorDisplayName));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> updateProject(
            @RequestBody UpdateProjectRequest request,
            @PathVariable UUID projectId,
            Authentication authentication) {
        System.out.println("Updating project with ID: " + projectId);
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        projectService.updateProject(request, principal.getUserId(), projectId);

        return ApiResponseBuilder.noContent();
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{projectId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable UUID projectId,
            Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        projectService.deactivate(projectId, principal.getUserId());

        return ApiResponseBuilder.noContent();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats(Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        long projectCount = projectService.countUserProjects(principal.getUserId());
        long documentCount = documentService.countUserDocuments(principal.getUserId());

        UserStatsResponse stats = new UserStatsResponse(projectCount, documentCount);

        return ApiResponseBuilder.success("Get user stats successfully", stats);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/recent-documents")
    public ResponseEntity<ApiResponse<List<RecentDocumentResponse>>> getRecentDocuments(Authentication authentication) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        Page<Document> documents = documentService.getRecentUserDocuments(
                principal.getUserId(),
                PageRequest.of(0, 10));

        List<RecentDocumentResponse> response = documents.getContent().stream()
                .map(doc -> new RecentDocumentResponse(
                        doc.getId(),
                        doc.getProjectId(),
                        doc.getTitle(),
                        doc.getFileType(),
                        doc.getFileSize(),
                        doc.getUpdatedAt()))
                .collect(Collectors.toList());

        return ApiResponseBuilder.success("Get recent documents successfully", response);
    }
}
