package com.kb.project.dto.response;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class ProjectResponse {
    private UUID projectId;
    private String projectName;
    private String description;
    private UUID createdBy;
}
