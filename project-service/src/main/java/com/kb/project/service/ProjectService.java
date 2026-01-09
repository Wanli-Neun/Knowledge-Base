package com.kb.project.service;

import com.kb.project.dto.client.auth.UserInternalResponse;
import com.kb.project.dto.request.project.CreateProjectRequest;
import com.kb.project.dto.request.project.UpdateProjectRequest;
import com.kb.project.dto.response.ProjectResponse;
import com.kb.project.repository.MemberRepository;
import com.kb.project.repository.ProjectRepository;
import com.kb.project.entity.Project;

import java.util.UUID;

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
    public Project getProject(UUID projectId, UUID userId) {

        boolean isMember = memberRepository.existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);

        if (!isMember) {
            throw new RuntimeException("Access denied: User is not a member of the project");
        }

        Project project = projectRepository.findById(projectId)
            .orElseThrow( () -> new RuntimeException("Project not found"));
        
        return project;
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
            displayName
        );

        return project;
    }

    @Transactional
    public void updateProject(UpdateProjectRequest request, UUID userId, UUID projectId) {

        Project project = projectRepository.findById(projectId)
            .orElseThrow( () -> new RuntimeException("Project not found"));

        project.updateDetails(
            request.projectName(),
            request.description(),
            userId
        );

    }

    @Transactional
    public void deactivate(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow( () -> new RuntimeException("Project not found"));

        project.deactivate(userId);
    }

}
