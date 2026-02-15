package com.incial.crm.controller;

import com.incial.crm.dto.AlertDto;
import com.incial.crm.dto.AlertSummaryDto;
import com.incial.crm.dto.ApiResponse;
import com.incial.crm.entity.ProjectAlert;
import com.incial.crm.entity.ProjectAlert.AlertSeverity;
import com.incial.crm.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertController {
    
    private final AlertService alertService;
    
    /**
     * Get all active alerts - accessible to admin roles
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertDto>>> getActiveAlerts() {
        List<ProjectAlert> alerts = alertService.getActiveAlerts();
        List<AlertDto> alertDtos = alerts.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.<List<AlertDto>>builder()
            .success(true)
            .message("Active alerts retrieved successfully")
            .data(alertDtos)
            .build());
    }
    
    /**
     * Get alerts for a specific project
     */
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'SALES_COORDINATOR', 'ACCOUNTS', 'INSTALLATION', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertDto>>> getProjectAlerts(@PathVariable Long projectId) {
        List<ProjectAlert> alerts = alertService.getProjectAlerts(projectId);
        List<AlertDto> alertDtos = alerts.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.<List<AlertDto>>builder()
            .success(true)
            .message("Project alerts retrieved successfully")
            .data(alertDtos)
            .build());
    }
    
    /**
     * Get alert summary statistics
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AlertSummaryDto>> getAlertSummary() {
        AlertSummaryDto summary = AlertSummaryDto.builder()
            .totalAlerts(alertService.getActiveAlertCount())
            .criticalAlerts(alertService.getAlertCountBySeverity(AlertSeverity.CRITICAL))
            .warningAlerts(alertService.getAlertCountBySeverity(AlertSeverity.WARNING))
            .infoAlerts(alertService.getAlertCountBySeverity(AlertSeverity.INFO))
            .build();
        
        return ResponseEntity.ok(ApiResponse.<AlertSummaryDto>builder()
            .success(true)
            .message("Alert summary retrieved successfully")
            .data(summary)
            .build());
    }
    
    /**
     * Manually trigger alert generation (admin only)
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> generateAlerts() {
        alertService.generateDelayAlerts();
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Alert generation triggered successfully")
            .data("Alerts generated")
            .build());
    }
    
    /**
     * Dismiss an alert
     */
    @PostMapping("/{alertId}/dismiss")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> dismissAlert(
            @PathVariable Long alertId,
            Authentication authentication) {
        String username = authentication.getName();
        alertService.dismissAlert(alertId, username);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Alert dismissed successfully")
            .data("Alert dismissed")
            .build());
    }
    
    /**
     * Convert ProjectAlert entity to DTO
     */
    private AlertDto convertToDto(ProjectAlert alert) {
        return AlertDto.builder()
            .id(alert.getId())
            .projectId(alert.getProject().getId())
            .projectName(alert.getProject().getSchool())
            .alertType(alert.getAlertType())
            .severity(alert.getSeverity())
            .message(alert.getMessage())
            .createdAt(alert.getCreatedAt())
            .dismissedAt(alert.getDismissedAt())
            .dismissedBy(alert.getDismissedBy())
            .isActive(alert.getIsActive())
            .daysOverdue(alert.getDaysOverdue())
            .build();
    }
}
