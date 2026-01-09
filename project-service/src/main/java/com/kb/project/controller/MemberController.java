package com.kb.project.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kb.project.common.response.ApiResponse;
import com.kb.project.common.response.ApiResponseBuilder;
import com.kb.project.dto.request.member.AddMemberRequest;
import com.kb.project.dto.response.MemberResponse;
import com.kb.project.security.CustomUserPrincipal;
import com.kb.project.service.MemberService;
import com.kb.project.dto.request.member.UpdateMemberRequest;
import com.kb.project.entity.Member;
import com.kb.project.mapper.MemberMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("projects/{projectId}/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping()
    public ResponseEntity<ApiResponse<Page<MemberResponse>>> getMembers(
        @PathVariable UUID projectId,
        Pageable pageable,
        Authentication authentication
    ) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        Page<Member> members = memberService.getMembers(projectId, principal.getUserId(), pageable);

        Page<MemberResponse> response = members.map(MemberMapper::toResponse);

        return ApiResponseBuilder.success("Get members successfully", response);
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping()
    public ResponseEntity<ApiResponse<MemberResponse>> addMember(
        @RequestBody AddMemberRequest request,
        @PathVariable UUID projectId,
        Authentication authentication
    ){
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        Member member = memberService.addMember(projectId, request.userId(), principal.getUserId());

        return ApiResponseBuilder.created("Add member sucessfully", MemberMapper.toResponse(member));
    }


    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{memberId}")
    public ResponseEntity<ApiResponse<MemberResponse>> update(
        @PathVariable UUID projectId,
        @PathVariable UUID memberId,
        @RequestBody UpdateMemberRequest request,
        Authentication authentication
    ) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        Member member = memberService.update(memberId, projectId, principal.getUserId(), request.getDisplayName(), request.getIsActive());

        return ApiResponseBuilder.success("Update member successfully", MemberMapper.toResponse(member));
    }

}
