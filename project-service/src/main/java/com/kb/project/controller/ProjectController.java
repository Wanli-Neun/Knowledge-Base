package com.kb.project.controller;

import com.kb.project.common.response.ApiResponse;
import com.kb.project.common.response.ApiResponseBuilder;
import com.kb.project.dto.request.project.CreateProjectRequest;
import com.kb.project.dto.request.project.UpdateProjectRequest;
import com.kb.project.dto.response.ProjectResponse;
import com.kb.project.security.CustomUserPrincipal;
import com.kb.project.service.ProjectService;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(Pageable pageable){
        Page<ProjectResponse> projects = projectService.getAllProjects(pageable);

        return ApiResponseBuilder.success("Get all projects successfully", projects);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
        @RequestBody CreateProjectRequest request,
        Authentication authentication
    ){
        CustomUserPrincipal userPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
        ProjectResponse project = projectService.createProject(request, userPrincipal.getUserId());

        return ApiResponseBuilder.created("Project created successfully", project);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
        @PathVariable UUID projectId,
        Authentication authentication
    ){
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        ProjectResponse project = projectService.getProject(projectId);

        return ApiResponseBuilder.success("Get project successfully", project);
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> updateProject(
        @RequestBody UpdateProjectRequest request,
        @PathVariable UUID projectId,
        Authentication authentication
    ){
        System.out.println("Updating project with ID: " + projectId);
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        projectService.updateProject(request, principal.getUserId(), projectId);

        return ApiResponseBuilder.noContent();
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{projectId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(
        @PathVariable UUID projectId,
        Authentication authentication
    ){
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        projectService.deactivate(projectId, principal.getUserId());

        return ApiResponseBuilder.noContent();
    }
}
