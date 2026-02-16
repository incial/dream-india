package com.incial.crm.controller;

import com.incial.crm.dto.AnalyticsDto;
import com.incial.crm.dto.ApiResponse;
import com.incial.crm.dto.FinancialSummaryDto;
import com.incial.crm.dto.MonthlyTrendDto;
import com.incial.crm.dto.StageDistributionDto;
import com.incial.crm.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Get comprehensive dashboard analytics
     * Only accessible by SUPER_ADMIN
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getDashboardAnalytics() {
        log.info("Request received: GET /api/v1/analytics/dashboard");
        try {
            AnalyticsDto analytics = analyticsService.getDashboardAnalytics();
            return ResponseEntity.ok(ApiResponse.<AnalyticsDto>builder()
                    .success(true)
                    .message("Analytics data retrieved successfully")
                    .data(analytics)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching dashboard analytics", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<AnalyticsDto>builder()
                    .success(false)
                    .message("Failed to fetch analytics data: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Get stage distribution
     * Only accessible by SUPER_ADMIN
     */
    @GetMapping("/stage-distribution")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<StageDistributionDto>>> getStageDistribution() {
        log.info("Request received: GET /api/v1/analytics/stage-distribution");
        try {
            List<StageDistributionDto> distribution = analyticsService.getStageDistribution();
            return ResponseEntity.ok(ApiResponse.<List<StageDistributionDto>>builder()
                    .success(true)
                    .message("Stage distribution retrieved successfully")
                    .data(distribution)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching stage distribution", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<List<StageDistributionDto>>builder()
                    .success(false)
                    .message("Failed to fetch stage distribution: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Get monthly trends
     * Only accessible by SUPER_ADMIN
     */
    @GetMapping("/monthly-trends")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MonthlyTrendDto>>> getMonthlyTrends() {
        log.info("Request received: GET /api/v1/analytics/monthly-trends");
        try {
            List<MonthlyTrendDto> trends = analyticsService.getMonthlyTrends();
            return ResponseEntity.ok(ApiResponse.<List<MonthlyTrendDto>>builder()
                    .success(true)
                    .message("Monthly trends retrieved successfully")
                    .data(trends)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching monthly trends", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<List<MonthlyTrendDto>>builder()
                    .success(false)
                    .message("Failed to fetch monthly trends: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Get financial summary
     * Only accessible by SUPER_ADMIN
     */
    @GetMapping("/financial-summary")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<FinancialSummaryDto>> getFinancialSummary() {
        log.info("Request received: GET /api/v1/analytics/financial-summary");
        try {
            FinancialSummaryDto summary = analyticsService.getFinancialSummary();
            return ResponseEntity.ok(ApiResponse.<FinancialSummaryDto>builder()
                    .success(true)
                    .message("Financial summary retrieved successfully")
                    .data(summary)
                    .build());
        } catch (Exception e) {
            log.error("Error fetching financial summary", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<FinancialSummaryDto>builder()
                    .success(false)
                    .message("Failed to fetch financial summary: " + e.getMessage())
                    .build());
        }
    }
}
