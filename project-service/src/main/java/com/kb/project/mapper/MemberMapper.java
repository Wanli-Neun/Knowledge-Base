package com.kb.project.mapper;

import com.kb.project.dto.response.MemberResponse;
import com.kb.project.entity.Member;

public class MemberMapper {

    private MemberMapper(){}

    public static MemberResponse toResponse(Member member){
        return MemberResponse.builder()
            .projectId(member.getProjectId())
            .displayName(member.getDisplayName())
            .addedBy(member.getAddedBy())
            .build();
    }
    
}
