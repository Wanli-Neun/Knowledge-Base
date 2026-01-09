package com.kb.project.mapper;

import com.kb.project.dto.response.ProjectResponse;
import com.kb.project.entity.Project;

public class ProjectMapper {

    private ProjectMapper() {}

    public static ProjectResponse toResponse(Project project){
        return ProjectResponse.builder()
            .projectId(project.getId())
            .projectName(project.getName())
            .description(project.getDescription())
            .createdBy(project.getCreatedBy())
            .build();
    }
    
}
