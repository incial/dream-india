package com.incial.crm.service;

import com.incial.crm.dto.AnalyticsDto;
import com.incial.crm.dto.FinancialSummaryDto;
import com.incial.crm.dto.MonthlyTrendDto;
import com.incial.crm.dto.StageDistributionDto;
import com.incial.crm.entity.Project;
import com.incial.crm.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ProjectRepository projectRepository;
    
    private static final String STAGE_COMPLETED = "COMPLETED";

    /**
     * Get comprehensive analytics dashboard data
     */
    public AnalyticsDto getDashboardAnalytics() {
        log.info("Generating dashboard analytics");
        
        List<Project> allProjects = projectRepository.findAll();
        
        // Calculate overall statistics
        long totalProjects = allProjects.size();
        long completedProjects = allProjects.stream()
                .filter(p -> STAGE_COMPLETED.equals(p.getCurrentStage()))
                .count();
        long activeProjects = totalProjects - completedProjects;
        double successRate = totalProjects > 0 ? (completedProjects * 100.0 / totalProjects) : 0;
        
        // Get financial summary
        FinancialSummaryDto financialSummary = calculateFinancialSummary(allProjects);
        
        // Get stage distribution
        List<StageDistributionDto> stageDistribution = calculateStageDistribution(allProjects);
        
        // Get monthly trends
        List<MonthlyTrendDto> monthlyTrends = calculateMonthlyTrends(allProjects);
        
        // Calculate this month's stats
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long projectsThisMonth = allProjects.stream()
                .filter(p -> p.getCreatedDate() != null && p.getCreatedDate().isAfter(startOfMonth))
                .count();
        long completedThisMonth = allProjects.stream()
                .filter(p -> STAGE_COMPLETED.equals(p.getCurrentStage()))
                .filter(p -> p.getStageChangeTimestamp() != null && p.getStageChangeTimestamp().isAfter(startOfMonth))
                .count();
        double revenueThisMonth = allProjects.stream()
                .filter(p -> STAGE_COMPLETED.equals(p.getCurrentStage()))
                .filter(p -> p.getStageChangeTimestamp() != null && p.getStageChangeTimestamp().isAfter(startOfMonth))
                .mapToDouble(p -> p.getProjectValue() != null ? p.getProjectValue().doubleValue() : 0.0)
                .sum();
        
        return AnalyticsDto.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .successRate(Math.round(successRate * 100.0) / 100.0)
                .financialSummary(financialSummary)
                .stageDistribution(stageDistribution)
                .monthlyTrends(monthlyTrends)
                .projectsThisMonth(projectsThisMonth)
                .completedThisMonth(completedThisMonth)
                .revenueThisMonth(Math.round(revenueThisMonth * 100.0) / 100.0)
                .build();
    }

    /**
     * Calculate financial summary
     */
    private FinancialSummaryDto calculateFinancialSummary(List<Project> projects) {
        double completedRevenue = projects.stream()
                .filter(p -> STAGE_COMPLETED.equals(p.getCurrentStage()))
                .mapToDouble(p -> p.getProjectValue() != null ? p.getProjectValue().doubleValue() : 0.0)
                .sum();
        
        // Calculate total revenue from all projects (invoice amount is the authoritative total)
        double totalRevenue = projects.stream()
                .mapToDouble(p -> {
                    // Use invoiceAmount if available, otherwise use projectValue
                    BigDecimal amount = p.getInvoiceAmount() != null ? p.getInvoiceAmount() : p.getProjectValue();
                    return amount != null ? amount.doubleValue() : 0.0;
                })
                .sum();
        
        double totalReceived = projects.stream()
                .mapToDouble(p -> p.getAmountReceived() != null ? p.getAmountReceived().doubleValue() : 0.0)
                .sum();
        
        // Pending Revenue = Total Invoice Amount - Total Received (actual unpaid balance)
        // This will update dynamically as payments are recorded
        double pendingRevenue = projects.stream()
                .mapToDouble(p -> p.getPendingAmount() != null ? p.getPendingAmount().doubleValue() : 0.0)
                .sum();
        
        double totalPending = pendingRevenue; // Same as pendingRevenue for consistency
        
        return FinancialSummaryDto.builder()
                .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
                .completedRevenue(Math.round(completedRevenue * 100.0) / 100.0)
                .pendingRevenue(Math.round(pendingRevenue * 100.0) / 100.0)
                .totalReceived(Math.round(totalReceived * 100.0) / 100.0)
                .totalPending(Math.round(totalPending * 100.0) / 100.0)
                .build();
    }

    /**
     * Calculate stage distribution
     */
    private List<StageDistributionDto> calculateStageDistribution(List<Project> projects) {
        long totalProjects = projects.size();
        
        Map<String, Long> stageCount = projects.stream()
                .collect(Collectors.groupingBy(
                        Project::getCurrentStage,
                        Collectors.counting()
                ));
        
        return stageCount.entrySet().stream()
                .map(entry -> {
                    double percentage = totalProjects > 0 ? (entry.getValue() * 100.0 / totalProjects) : 0;
                    return StageDistributionDto.builder()
                            .stage(entry.getKey())
                            .count(entry.getValue())
                            .percentage(Math.round(percentage * 100.0) / 100.0)
                            .build();
                })
                .sorted(Comparator.comparing(StageDistributionDto::getStage))
                .collect(Collectors.toList());
    }

    /**
     * Calculate monthly trends for last 6 months
     */
    private List<MonthlyTrendDto> calculateMonthlyTrends(List<Project> projects) {
        LocalDateTime now = LocalDateTime.now();
        List<MonthlyTrendDto> trends = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            // Projects created in this month
            long projectCount = projects.stream()
                    .filter(p -> p.getCreatedDate() != null)
                    .filter(p -> !p.getCreatedDate().isBefore(monthStart) && p.getCreatedDate().isBefore(monthEnd))
                    .count();
            
            // Projects completed in this month
            long completedCount = projects.stream()
                    .filter(p -> STAGE_COMPLETED.equals(p.getCurrentStage()))
                    .filter(p -> p.getStageChangeTimestamp() != null)
                    .filter(p -> !p.getStageChangeTimestamp().isBefore(monthStart) && p.getStageChangeTimestamp().isBefore(monthEnd))
                    .count();
            
            // Revenue from completed projects in this month
            double revenue = projects.stream()
                    .filter(p -> STAGE_COMPLETED.equals(p.getCurrentStage()))
                    .filter(p -> p.getStageChangeTimestamp() != null)
                    .filter(p -> !p.getStageChangeTimestamp().isBefore(monthStart) && p.getStageChangeTimestamp().isBefore(monthEnd))
                    .mapToDouble(p -> p.getProjectValue() != null ? p.getProjectValue().doubleValue() : 0.0)
                    .sum();
            
            trends.add(MonthlyTrendDto.builder()
                    .month(monthStart.format(monthFormatter))
                    .year(monthStart.getYear())
                    .projectCount(projectCount)
                    .completedCount(completedCount)
                    .revenue(Math.round(revenue * 100.0) / 100.0)
                    .build());
        }
        
        return trends;
    }

    /**
     * Get stage distribution only
     */
    public List<StageDistributionDto> getStageDistribution() {
        List<Project> allProjects = projectRepository.findAll();
        return calculateStageDistribution(allProjects);
    }

    /**
     * Get monthly trends only
     */
    public List<MonthlyTrendDto> getMonthlyTrends() {
        List<Project> allProjects = projectRepository.findAll();
        return calculateMonthlyTrends(allProjects);
    }

    /**
     * Get financial summary only
     */
    public FinancialSummaryDto getFinancialSummary() {
        List<Project> allProjects = projectRepository.findAll();
        return calculateFinancialSummary(allProjects);
    }
}
