package com.kb.project.service;

import com.kb.project.client.auth.AuthUserClient;
import com.kb.project.dto.client.auth.UserInternalResponse;
import com.kb.project.dto.response.MemberResponse;
import com.kb.project.repository.MemberRepository;

import com.kb.project.entity.Member;
import com.kb.project.repository.ProjectRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.User;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final AuthUserClient authUserClient;

    @Transactional
    public MemberResponse addMember(
        UUID projectId,
        UUID targetUserId,
        UUID addedBy
    ){

        boolean existsProject = projectRepository.existsById(projectId);

        if (!existsProject) {
            throw new RuntimeException("Project not found");
        }

        boolean existsUser = memberRepository.existsByProjectIdAndUserIdAndIsActiveTrue(projectId, targetUserId);

        if (existsUser) {
            throw new RuntimeException("Member already exists in the project");
        }

        UserInternalResponse userInfo = getUserInfo(targetUserId);
        String displayName = userInfo.getDisplayName();

        Member member = addMemberInternal(projectId, targetUserId, addedBy, displayName);

        return toMemberResponse(member);
    }

    public Member addMemberInternal(
        UUID projectId,
        UUID targetUserId,
        UUID addedBy,
        String displayName
    ){
        Member member = Member.builder()
            .projectId(projectId)
            .userId(targetUserId)
            .displayName(displayName)
            .addedBy(addedBy)
            .updatedBy(addedBy)
            .build();
        return memberRepository.save(member);
    }

    @Transactional
    public MemberResponse update(UUID memberId, UUID projectId, UUID updatedBy, String displayName, Boolean isActive){
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));

        member.update(projectId, displayName, updatedBy, isActive);

        return toMemberResponse(member);

    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> getMembers(UUID projectId, UUID userId, Pageable pageable){

        boolean isMember = memberRepository.existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);

        if (!isMember) {
            throw new AccessDeniedException("Access denied: User is not a member of the project");
        }

        return memberRepository.findByProjectIdAndIsActiveTrue(projectId, pageable)
            .map(this::toMemberResponse);
    }

    public UserInternalResponse getUserInfo(UUID userId){
        return authUserClient.getUserById(userId);
    }


    private MemberResponse toMemberResponse(Member member) {
        return MemberResponse.builder()
            .projectId(member.getProjectId())
            .addedBy(member.getAddedBy())
            .displayName(member.getDisplayName())
            .build();
    }

}
