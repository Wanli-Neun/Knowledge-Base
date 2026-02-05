package com.kb.project.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kb.project.common.response.ApiResponse;
import com.kb.project.common.response.ApiResponseBuilder;
import com.kb.project.dto.response.DocumentResponse;
import com.kb.project.dto.response.StatsResponse;
import com.kb.project.dto.response.TimeSeriesDataPoint;
import com.kb.project.entity.Document;
import com.kb.project.mapper.DocumentMapper;
import com.kb.project.service.DocumentService;
import com.kb.project.service.ProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DocumentService documentService;
    private final ProjectService projectService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getAllDocuments(Pageable pageable) {
        Page<Document> documents = documentService.getAllDocuments(pageable);

        Page<DocumentResponse> response = documents.map(doc -> {
            String uploaderName = documentService.getUploaderDisplayName(doc.getUploadedBy());
            return DocumentMapper.toResponseWithUploader(doc, uploaderName);
        });

        return ApiResponseBuilder.success("Get all documents successfully", response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/documents")
    public ResponseEntity<ApiResponse<StatsResponse>> getDocumentStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        StatsResponse stats = StatsResponse.builder()
                .total(documentService.getTotalDocuments(startDate, endDate))
                .active(documentService.getActiveDocuments(startDate, endDate))
                .inactive(documentService.getInactiveDocuments(startDate, endDate))
                .build();
        return ApiResponseBuilder.success("Get document stats successfully", stats);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/projects")
    public ResponseEntity<ApiResponse<StatsResponse>> getProjectStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        StatsResponse stats = StatsResponse.builder()
                .total(projectService.getTotalProjects(startDate, endDate))
                .active(projectService.getActiveProjects(startDate, endDate))
                .inactive(projectService.getInactiveProjects(startDate, endDate))
                .build();
        return ApiResponseBuilder.success("Get project stats successfully", stats);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/projects/timeseries")
    public ResponseEntity<ApiResponse<List<TimeSeriesDataPoint>>> getProjectTimeSeries(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<TimeSeriesDataPoint> timeSeries = projectService.getProjectTimeSeries(days, startDate, endDate);
        return ApiResponseBuilder.success("Get project time series successfully", timeSeries);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/documents/timeseries")
    public ResponseEntity<ApiResponse<List<TimeSeriesDataPoint>>> getDocumentTimeSeries(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<TimeSeriesDataPoint> timeSeries = documentService.getDocumentTimeSeries(days, startDate, endDate);
        return ApiResponseBuilder.success("Get document time series successfully", timeSeries);
    }
}
