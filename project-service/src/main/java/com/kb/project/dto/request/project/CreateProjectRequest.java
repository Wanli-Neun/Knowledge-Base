package com.kb.project.dto.request.project;

public record CreateProjectRequest(
    String projectName,
    String description
) {}
