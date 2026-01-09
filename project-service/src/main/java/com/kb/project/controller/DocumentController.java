package com.kb.project.controller;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;

import com.kb.project.common.response.ApiResponse;
import com.kb.project.common.response.ApiResponseBuilder;
import com.kb.project.entity.Document;
import com.kb.project.mapper.DocumentMapper;
import com.kb.project.security.CustomUserPrincipal;
import com.kb.project.service.DocumentService;
import com.kb.project.dto.response.DocumentResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/projects/{projectId}/documents")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
        @PathVariable UUID projectId,
        @RequestPart("file") MultipartFile file,
        Authentication authentication
    ) throws IOException{

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        Document document = documentService.upload(
            projectId,
            principal.getUserId(),
            file
        );

        return ApiResponseBuilder.success("Upload document successfully", DocumentMapper.toResponse(document));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @PathVariable UUID projectId,
        @PathVariable UUID documentId,
        Authentication authentication
    ){
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        documentService.delete(projectId, documentId, principal.getUserId());

        return ApiResponseBuilder.success();
    }

    @GetMapping()
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getDocumentsByProject(
        @PathVariable UUID projectId,
        Authentication authentication,
        Pageable pageable
    ){
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        Page<Document> documents = documentService.getDocumentsbyProject(projectId, principal.getUserId(), pageable);

        Page<DocumentResponse> response = documents.map(DocumentMapper::toResponse);
        
        return ApiResponseBuilder.success("Get documents successfully", response);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentDetail(
        @PathVariable UUID projectId,
        @PathVariable UUID documentId,
        Authentication authentication
    ){
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        Document document = documentService.getDocumentById(projectId, documentId, principal.getUserId());

        String downloadUrl = documentService.generateDownloadUrl(projectId, documentId, principal.getUserId(), Duration.ofMinutes(15));
        
        return ApiResponseBuilder.success("Get document successfully", DocumentMapper.toResponse(document, downloadUrl));
    
    }



}
