package com.incial.crm.service;

import com.incial.crm.entity.Project;
import com.incial.crm.entity.ProjectAlert;
import com.incial.crm.entity.ProjectAlert.AlertSeverity;
import com.incial.crm.entity.ProjectAlert.AlertType;
import com.incial.crm.repository.ProjectAlertRepository;
import com.incial.crm.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {
    
    private final ProjectAlertRepository alertRepository;
    private final ProjectRepository projectRepository;
    
    // Threshold constants from PRD
    private static final int STAGE_INACTIVITY_DAYS = 7;  // In Review > 7 days
    private static final int PAYMENT_DELAY_DAYS = 10;    // Accounts > 10 days
    private static final int INSTALLATION_DELAY_DAYS = 5; // Installation > 5 days
    
    /**
     * Scan all projects and generate alerts for delays
     */
    @Transactional
    public void generateDelayAlerts() {
        log.info("Starting delay alert generation scan...");
        
        checkStageInactivity();
        checkPaymentDelays();
        checkInstallationDelays();
        
        log.info("Delay alert generation scan completed");
    }
    
    /**
     * Check for projects stuck in IN_REVIEW stage > 7 days
     */
    private void checkStageInactivity() {
        List<Project> inReviewProjects = projectRepository.findByCurrentStage("IN_REVIEW");
        
        for (Project project : inReviewProjects) {
            if (project.getStageChangeTimestamp() != null) {
                long daysInStage = ChronoUnit.DAYS.between(project.getStageChangeTimestamp(), LocalDateTime.now());
                
                if (daysInStage > STAGE_INACTIVITY_DAYS) {
                    // Check if alert already exists
                    List<ProjectAlert> existingAlerts = alertRepository.findActiveAlertsByProjectAndType(
                        project.getId(), AlertType.STAGE_INACTIVITY
                    );
                    
                    if (existingAlerts.isEmpty()) {
                        createAlert(
                            project,
                            AlertType.STAGE_INACTIVITY,
                            AlertSeverity.WARNING,
                            String.format("Project '%s' has been in Review stage for %d days (threshold: %d days)",
                                project.getSchool(), daysInStage, STAGE_INACTIVITY_DAYS),
                            (int) daysInStage - STAGE_INACTIVITY_DAYS
                        );
                        log.info("Created stage inactivity alert for project: {}", project.getId());
                    }
                }
            }
        }
    }
    
    /**
     * Check for projects in ACCOUNTS stage > 10 days
     */
    private void checkPaymentDelays() {
        List<Project> accountsProjects = projectRepository.findByCurrentStage("ACCOUNTS");
        
        for (Project project : accountsProjects) {
            if (project.getStageChangeTimestamp() != null) {
                long daysInStage = ChronoUnit.DAYS.between(project.getStageChangeTimestamp(), LocalDateTime.now());
                
                if (daysInStage > PAYMENT_DELAY_DAYS) {
                    List<ProjectAlert> existingAlerts = alertRepository.findActiveAlertsByProjectAndType(
                        project.getId(), AlertType.PAYMENT_DELAY
                    );
                    
                    if (existingAlerts.isEmpty()) {
                        createAlert(
                            project,
                            AlertType.PAYMENT_DELAY,
                            AlertSeverity.CRITICAL,
                            String.format("Payment pending for project '%s' for %d days (threshold: %d days). " +
                                "Invoice Amount: ₹%s, Pending: ₹%s",
                                project.getSchool(), daysInStage, PAYMENT_DELAY_DAYS,
                                formatCurrency(project.getInvoiceAmount()),
                                formatCurrency(project.getPendingAmount())),
                            (int) daysInStage - PAYMENT_DELAY_DAYS
                        );
                        log.info("Created payment delay alert for project: {}", project.getId());
                    }
                }
            }
        }
    }
    
    /**
     * Check for projects in INSTALLATION stage > 5 days
     */
    private void checkInstallationDelays() {
        List<Project> installationProjects = projectRepository.findByCurrentStage("INSTALLATION");
        
        for (Project project : installationProjects) {
            if (project.getStageChangeTimestamp() != null) {
                long daysInStage = ChronoUnit.DAYS.between(project.getStageChangeTimestamp(), LocalDateTime.now());
                
                if (daysInStage > INSTALLATION_DELAY_DAYS) {
                    List<ProjectAlert> existingAlerts = alertRepository.findActiveAlertsByProjectAndType(
                        project.getId(), AlertType.INSTALLATION_DELAY
                    );
                    
                    if (existingAlerts.isEmpty()) {
                        createAlert(
                            project,
                            AlertType.INSTALLATION_DELAY,
                            AlertSeverity.CRITICAL,
                            String.format("Installation pending for project '%s' for %d days (threshold: %d days). " +
                                "Expected Delivery: %s",
                                project.getSchool(), daysInStage, INSTALLATION_DELAY_DAYS,
                                project.getExpectedDeliveryDate() != null ? project.getExpectedDeliveryDate() : "Not set"),
                            (int) daysInStage - INSTALLATION_DELAY_DAYS
                        );
                        log.info("Created installation delay alert for project: {}", project.getId());
                    }
                }
            }
        }
    }
    
    /**
     * Create a new alert
     */
    private void createAlert(Project project, AlertType type, AlertSeverity severity, 
                            String message, int daysOverdue) {
        ProjectAlert alert = ProjectAlert.builder()
            .project(project)
            .alertType(type)
            .severity(severity)
            .message(message)
            .daysOverdue(daysOverdue)
            .isActive(true)
            .build();
        
        alertRepository.save(alert);
    }
    
    /**
     * Get all active alerts
     */
    public List<ProjectAlert> getActiveAlerts() {
        return alertRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }
    
    /**
     * Get alerts for a specific project
     */
    public List<ProjectAlert> getProjectAlerts(Long projectId) {
        return alertRepository.findByProjectIdAndIsActiveTrue(projectId);
    }
    
    /**
     * Get alert count by severity
     */
    public Long getAlertCountBySeverity(AlertSeverity severity) {
        return alertRepository.countActiveBySeverity(severity);
    }
    
    /**
     * Get total active alert count
     */
    public Long getActiveAlertCount() {
        return alertRepository.countActiveAlerts();
    }
    
    /**
     * Dismiss an alert
     */
    @Transactional
    public void dismissAlert(Long alertId, String dismissedBy) {
        ProjectAlert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setIsActive(false);
        alert.setDismissedAt(LocalDateTime.now());
        alert.setDismissedBy(dismissedBy);
        
        alertRepository.save(alert);
        log.info("Alert {} dismissed by {}", alertId, dismissedBy);
    }
    
    /**
     * Auto-dismiss alerts when project moves to next stage
     */
    @Transactional
    public void autoDismissAlertsForProject(Long projectId, AlertType alertType) {
        List<ProjectAlert> alerts = alertRepository.findActiveAlertsByProjectAndType(projectId, alertType);
        
        for (ProjectAlert alert : alerts) {
            alert.setIsActive(false);
            alert.setDismissedAt(LocalDateTime.now());
            alert.setDismissedBy("SYSTEM");
            alertRepository.save(alert);
        }
        
        if (!alerts.isEmpty()) {
            log.info("Auto-dismissed {} alerts for project {}", alerts.size(), projectId);
        }
    }
    
    private String formatCurrency(java.math.BigDecimal amount) {
        if (amount == null) return "0";
        return String.format("%,.2f", amount);
    }
}
