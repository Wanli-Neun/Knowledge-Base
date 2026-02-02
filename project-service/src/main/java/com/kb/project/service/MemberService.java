package com.kb.project.service;

import com.kb.project.client.auth.AuthUserClient;
import com.kb.project.dto.client.auth.UserInternalResponse;
import com.kb.project.repository.MemberRepository;

import com.kb.project.entity.Member;
import com.kb.project.repository.ProjectRepository;

import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
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
    public Member addMember(
            UUID projectId,
            UUID targetUserId,
            UUID addedBy) {

        // Kiểm tra project có tồn tại không
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Kiểm tra người thêm member có phải là creator không
        if (!project.getCreatedBy().equals(addedBy)) {
            throw new AccessDeniedException("Only project creator can add members");
        }

        // Kiểm tra xem member đã tồn tại chưa (kể cả khi isActive = false)
        Optional<Member> existingMember = memberRepository.findByProjectIdAndUserId(projectId, targetUserId);

        if (existingMember.isPresent()) {
            Member member = existingMember.get();

            // Nếu member đã active rồi thì báo lỗi
            if (member.isActive()) {
                throw new RuntimeException("Member already exists in the project");
            }

            // Nếu member bị deactivate thì reactive lại
            member.update(projectId, member.getDisplayName(), addedBy, true);
            return member;
        }

        // Nếu chưa tồn tại thì tạo mới
        UserInternalResponse userInfo = getUserInfo(targetUserId);
        String displayName = userInfo.getDisplayName();

        Member member = addMemberInternal(projectId, targetUserId, addedBy, displayName);

        return member;
    }

    public Member addMemberInternal(
            UUID projectId,
            UUID targetUserId,
            UUID addedBy,
            String displayName) {
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
    public Member update(UUID memberId, UUID projectId, UUID updatedBy, String displayName, Boolean isActive) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.update(projectId, displayName, updatedBy, isActive);

        return member;

    }

    @Transactional(readOnly = true)
    public Page<Member> getMembers(UUID projectId, UUID userId, Pageable pageable) {

        boolean isMember = memberRepository.existsByProjectIdAndUserIdAndIsActiveTrue(projectId, userId);

        if (!isMember) {
            throw new AccessDeniedException("Access denied: User is not a member of the project");
        }

        return memberRepository.findByProjectIdAndIsActiveTrue(projectId, pageable);
    }

    @Transactional
    public void removeMember(UUID projectId, UUID targetUserId, UUID requestUserId) {
        // Kiểm tra project có tồn tại không
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Kiểm tra người request có phải là creator không
        if (!project.getCreatedBy().equals(requestUserId)) {
            throw new AccessDeniedException("Only project creator can remove members");
        }

        // Không cho phép creator tự xóa mình
        if (targetUserId.equals(requestUserId)) {
            throw new RuntimeException("Cannot remove yourself from the project");
        }

        // Tìm member cần xóa
        Member member = memberRepository.findByProjectIdAndUserIdAndIsActiveTrue(projectId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Member not found in this project"));

        // Xóa member (soft delete bằng cách set isActive = false)
        member.update(projectId, member.getDisplayName(), requestUserId, false);
    }

    public UserInternalResponse getUserInfo(UUID userId) {
        return authUserClient.getUserById(userId);
    }

}
