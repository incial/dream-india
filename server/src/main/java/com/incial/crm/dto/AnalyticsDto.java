package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    // Overall Statistics
    private Long totalProjects;
    private Long activeProjects;
    private Long completedProjects;
    private Double successRate;
    
    // Financial Summary
    private FinancialSummaryDto financialSummary;
    
    // Stage Distribution
    private List<StageDistributionDto> stageDistribution;
    
    // Monthly Trends (last 6 months)
    private List<MonthlyTrendDto> monthlyTrends;
    
    // Quick Stats
    private Long projectsThisMonth;
    private Long completedThisMonth;
    private Double revenueThisMonth;
}
