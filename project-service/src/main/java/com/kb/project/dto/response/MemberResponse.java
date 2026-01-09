package com.kb.project.dto.response;


import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class MemberResponse {

    private UUID projectId;
    private String displayName;
    private UUID addedBy;

}
