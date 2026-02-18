package com.incial.crm.service;

import com.incial.crm.dto.*;
import com.incial.crm.entity.PaymentTransaction;
import com.incial.crm.entity.Project;
import com.incial.crm.entity.ProjectActivityLog;
import com.incial.crm.entity.ProjectStageHistory;
import com.incial.crm.enums.ExecutiveProjectStatus;
import com.incial.crm.repository.PaymentTransactionRepository;
import com.incial.crm.repository.ProjectActivityLogRepository;
import com.incial.crm.repository.ProjectRepository;
import com.incial.crm.repository.ProjectStageHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectActivityLogRepository activityLogRepository;

    @Autowired
    private ProjectStageHistoryRepository stageHistoryRepository;
    
    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;
    
    @Autowired(required = false)
    private AlertService alertService;

    // Stage definitions
    private static final String STAGE_LEAD = "LEAD";
    private static final String STAGE_ON_PROGRESS = "ON_PROGRESS";
    private static final String STAGE_QUOTATION_SENT = "QUOTATION_SENT";
    private static final String STAGE_IN_REVIEW = "IN_REVIEW";
    private static final String STAGE_ONBOARDED = "ONBOARDED";
    private static final String STAGE_SALES = "SALES";
    private static final String STAGE_ACCOUNTS = "ACCOUNTS";
    private static final String STAGE_INSTALLATION = "INSTALLATION";
    private static final String STAGE_COMPLETED = "COMPLETED";

    // Role definitions
    private static final String ROLE_EXECUTIVE = "ROLE_EXECUTIVE";
    private static final String ROLE_SALES = "ROLE_SALES_COORDINATOR";
    private static final String ROLE_ACCOUNTS = "ROLE_ACCOUNTS";
    private static final String ROLE_INSTALLATION = "ROLE_INSTALLATION";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, String createdBy, String createdByRole) {
        // Check for duplicate contact number
        if (request.getContactNumber() != null && !request.getContactNumber().isEmpty()) {
            projectRepository.findByContactNumber(request.getContactNumber())
                .ifPresent(p -> {
                    throw new RuntimeException("A project with this contact number already exists");
                });
        }

        Project project = Project.builder()
                .school(request.getSchool())
                .contactPerson(request.getContactPerson())
                .contactNumber(request.getContactNumber())
                .place(request.getPlace())
                .district(request.getDistrict())
                .region(request.getRegion())
                .projectName(request.getProjectName())
                .parentCompany(request.getParentCompany())
                .executiveRemarks(request.getExecutiveRemarks())
                .createdBy(createdBy)
                .currentStage(STAGE_LEAD)
                .currentOwnerRole(ROLE_EXECUTIVE)
                .isLocked(false)
                .build();

        project = projectRepository.save(project);

        // Log creation
        logActivity(project.getId(), "CREATED", null, null, null, createdBy, createdByRole, "Project created");

        // Log initial stage
        logStageChange(project.getId(), null, STAGE_LEAD, createdBy, createdByRole, "Initial stage", false);

        return convertToDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, CreateProjectRequest request, String updatedBy, String updatedByRole) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        // Check stage-based editing permissions
        String currentStage = project.getCurrentStage();
        
        // Completed projects cannot be edited
        if (STAGE_COMPLETED.equals(currentStage)) {
            throw new RuntimeException("Cannot edit completed projects");
        }

        // Determine if project is in non-onboarded stages (LEAD, ON_PROGRESS, QUOTATION_SENT, IN_REVIEW)
        boolean isNonOnboarded = STAGE_LEAD.equals(currentStage) ||
                                 STAGE_ON_PROGRESS.equals(currentStage) ||
                                 STAGE_QUOTATION_SENT.equals(currentStage) ||
                                 STAGE_IN_REVIEW.equals(currentStage);

        // Determine if project is in onboarded or later stages
        boolean isOnboardedOrLater = STAGE_ONBOARDED.equals(currentStage) ||
                                     STAGE_SALES.equals(currentStage) ||
                                     STAGE_ACCOUNTS.equals(currentStage) ||
                                     STAGE_INSTALLATION.equals(currentStage);

        // Permission check:
        // - Admin/Super Admin can edit any project at any stage
        // - For non-onboarded projects (LEAD, ON_PROGRESS, QUOTATION_SENT, IN_REVIEW): ANY executive can edit
        // - For onboarded projects (ONBOARDED, SALES, ACCOUNTS, INSTALLATION): only creator can edit
        boolean isAdmin = ROLE_ADMIN.equals(updatedByRole) || ROLE_SUPER_ADMIN.equals(updatedByRole);
        boolean isExecutive = ROLE_EXECUTIVE.equals(updatedByRole);
        
        if (!isAdmin) {
            if (isOnboardedOrLater && !project.getCreatedBy().equals(updatedBy)) {
                throw new RuntimeException("Only the project creator can edit onboarded projects");
            }
            if (!isExecutive) {
                throw new RuntimeException("Only executives and admins can edit projects");
            }
        }

        // Note: CreateProjectRequest only contains executive fields (school, contact info, location, remarks).
        // Financial fields (projectValue, invoiceAmount, paymentStatus, etc.) are managed through
        // separate APIs (updateSalesData, updateAccountsData, updateInstallationData).
        // Therefore, this method inherently only allows editing executive fields, which is the
        // intended behavior for onboarded projects.
        
        // The project lock (isLocked) is used to prevent unauthorized stage transitions and
        // modifications by other teams, but the creator can still update their executive fields
        // even when the project is locked.
        
        // Update executive fields (allowed in all non-completed stages)
        if (request.getSchool() != null) project.setSchool(request.getSchool());
        if (request.getContactPerson() != null) project.setContactPerson(request.getContactPerson());
        if (request.getContactNumber() != null) project.setContactNumber(request.getContactNumber());
        if (request.getPlace() != null) project.setPlace(request.getPlace());
        if (request.getDistrict() != null) project.setDistrict(request.getDistrict());
        if (request.getRegion() != null) project.setRegion(request.getRegion());
        if (request.getProjectName() != null) project.setProjectName(request.getProjectName());
        if (request.getParentCompany() != null) project.setParentCompany(request.getParentCompany());
        if (request.getExecutiveRemarks() != null) project.setExecutiveRemarks(request.getExecutiveRemarks());

        project.setLastUpdatedBy(updatedBy);
        project = projectRepository.save(project);

        String logMessage = isOnboardedOrLater ? 
            "Project executive fields updated" : 
            "Project details updated";
        logActivity(project.getId(), "FIELD_UPDATED", null, null, null, updatedBy, updatedByRole, logMessage);

        return convertToDto(project);
    }

    @Transactional
    public ProjectDto transitionStage(Long id, String toStage, String remarks, String changedBy, String changedByRole, boolean isSystemTriggered) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        String fromStage = project.getCurrentStage();

        // Validate stage transition (skip for system-triggered transitions)
        if (!isSystemTriggered) {
            validateStageTransition(fromStage, toStage, changedByRole);
        }

        // Update stage
        project.setPreviousStage(fromStage);
        project.setCurrentStage(toStage);
        project.setStageChangeTimestamp(LocalDateTime.now());
        project.setStageChangedBy(changedBy);
        project.setLastUpdatedBy(changedBy);

        // Update owner role based on stage
        updateOwnerRole(project, toStage);

        // Lock project when it moves to SALES (after onboarding automation)
        if (STAGE_SALES.equals(toStage)) {
            project.setIsLocked(true);
        }

        // Lock project if completed
        if (STAGE_COMPLETED.equals(toStage)) {
            project.setIsLocked(true);
        }

        project = projectRepository.save(project);

        // Log stage change
        logStageChange(project.getId(), fromStage, toStage, changedBy, changedByRole, remarks, isSystemTriggered);
        
        // Auto-dismiss alerts when project moves to next stage
        if (alertService != null) {
            if (STAGE_IN_REVIEW.equals(fromStage)) {
                alertService.autoDismissAlertsForProject(project.getId(), com.incial.crm.entity.ProjectAlert.AlertType.STAGE_INACTIVITY);
            }
            if (STAGE_ACCOUNTS.equals(fromStage)) {
                alertService.autoDismissAlertsForProject(project.getId(), com.incial.crm.entity.ProjectAlert.AlertType.PAYMENT_DELAY);
            }
            if (STAGE_INSTALLATION.equals(fromStage)) {
                alertService.autoDismissAlertsForProject(project.getId(), com.incial.crm.entity.ProjectAlert.AlertType.INSTALLATION_DELAY);
            }
        }

        // Trigger automation if necessary (only if not already system triggered to prevent recursion)
        if (!isSystemTriggered) {
            handleStageAutomation(project, changedBy, changedByRole);
        }

        return convertToDto(project);
    }

    private void validateStageTransition(String fromStage, String toStage, String userRole) {
        // Executive can transition: LEAD -> ON_PROGRESS -> QUOTATION_SENT -> IN_REVIEW -> ONBOARDED
        if (ROLE_EXECUTIVE.equals(userRole) || ROLE_ADMIN.equals(userRole) || ROLE_SUPER_ADMIN.equals(userRole)) {
            if (STAGE_LEAD.equals(fromStage) && STAGE_ON_PROGRESS.equals(toStage)) return;
            if (STAGE_ON_PROGRESS.equals(fromStage) && STAGE_QUOTATION_SENT.equals(toStage)) return;
            if (STAGE_QUOTATION_SENT.equals(fromStage) && STAGE_IN_REVIEW.equals(toStage)) return;
            if (STAGE_IN_REVIEW.equals(fromStage) && STAGE_ONBOARDED.equals(toStage)) return;
        }

        // Sales Coordinator can transition: SALES -> ACCOUNTS
        if (ROLE_SALES.equals(userRole) || ROLE_ADMIN.equals(userRole) || ROLE_SUPER_ADMIN.equals(userRole)) {
            if (STAGE_SALES.equals(fromStage) && STAGE_ACCOUNTS.equals(toStage)) return;
        }

        // Accounts can transition: ACCOUNTS -> INSTALLATION
        if (ROLE_ACCOUNTS.equals(userRole) || ROLE_ADMIN.equals(userRole) || ROLE_SUPER_ADMIN.equals(userRole)) {
            if (STAGE_ACCOUNTS.equals(fromStage) && STAGE_INSTALLATION.equals(toStage)) return;
        }

        // Installation can transition: INSTALLATION -> COMPLETED
        if (ROLE_INSTALLATION.equals(userRole) || ROLE_ADMIN.equals(userRole) || ROLE_SUPER_ADMIN.equals(userRole)) {
            if (STAGE_INSTALLATION.equals(fromStage) && STAGE_COMPLETED.equals(toStage)) return;
        }

        // Super Admin can override
        if (ROLE_SUPER_ADMIN.equals(userRole)) {
            return;
        }

        throw new RuntimeException("Invalid stage transition from " + fromStage + " to " + toStage + " for role " + userRole);
    }

    private void updateOwnerRole(Project project, String stage) {
        switch (stage) {
            case STAGE_LEAD:
            case STAGE_ON_PROGRESS:
            case STAGE_QUOTATION_SENT:
            case STAGE_IN_REVIEW:
                project.setCurrentOwnerRole(ROLE_EXECUTIVE);
                break;
            case STAGE_ONBOARDED:
            case STAGE_SALES:
                project.setCurrentOwnerRole(ROLE_SALES);
                break;
            case STAGE_ACCOUNTS:
                project.setCurrentOwnerRole(ROLE_ACCOUNTS);
                break;
            case STAGE_INSTALLATION:
                project.setCurrentOwnerRole(ROLE_INSTALLATION);
                break;
            case STAGE_COMPLETED:
                // Keep last owner role
                break;
        }
    }

    private void handleStageAutomation(Project project, String triggeredBy, String triggeredByRole) {
        // When ONBOARDED, automatically move to SALES queue
        if (STAGE_ONBOARDED.equals(project.getCurrentStage())) {
            transitionStage(project.getId(), STAGE_SALES, "Auto-assigned to Sales Coordinator", "SYSTEM", "SYSTEM", true);
        }
    }

    @Transactional
    public ProjectDto updateSalesData(Long id, UpdateSalesDataRequest request, String updatedBy, String updatedByRole) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        // Verify project is in SALES or ACCOUNTS stage
        if (!STAGE_SALES.equals(project.getCurrentStage()) && !STAGE_ACCOUNTS.equals(project.getCurrentStage())) {
            throw new RuntimeException("Sales data can only be updated when project is in SALES or ACCOUNTS stage");
        }

        // Update sales fields
        if (request.getProjectValue() != null) project.setProjectValue(request.getProjectValue());
        if (request.getInvoiceAmount() != null) project.setInvoiceAmount(request.getInvoiceAmount());
        if (request.getPendingDelivery() != null) project.setPendingDelivery(request.getPendingDelivery());
        if (request.getQuotationRemarks() != null) project.setQuotationRemarks(request.getQuotationRemarks());
        if (request.getExpectedDeliveryDate() != null) project.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        if (request.getSalesRemarks() != null) project.setSalesRemarks(request.getSalesRemarks());

        project.setSalesUpdatedTimestamp(LocalDateTime.now());
        project.setLastUpdatedBy(updatedBy);
        project = projectRepository.save(project);

        logActivity(project.getId(), "FIELD_UPDATED", null, null, null, updatedBy, updatedByRole, "Sales data updated");

        return convertToDto(project);
    }

    @Transactional
    public ProjectDto markReadyForAccounts(Long id, String updatedBy, String updatedByRole) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        // Validate required fields
        if (project.getProjectValue() == null || project.getInvoiceAmount() == null) {
            throw new RuntimeException("Project Value and Invoice Amount are required before moving to Accounts");
        }

        // Initialize pendingAmount if not already set
        if (project.getPendingAmount() == null) {
            BigDecimal amountReceived = project.getAmountReceived() != null ? project.getAmountReceived() : BigDecimal.ZERO;
            BigDecimal pending = project.getInvoiceAmount().subtract(amountReceived);
            if (pending.compareTo(BigDecimal.ZERO) < 0) {
                pending = BigDecimal.ZERO;
            }
            project.setPendingAmount(pending);
            project = projectRepository.save(project);
        }

        // Transition to ACCOUNTS stage
        return transitionStage(id, STAGE_ACCOUNTS, "Ready for accounts processing", updatedBy, updatedByRole, false);
    }

    @Transactional
    public ProjectDto updateAccountsData(Long id, UpdateAccountsDataRequest request, String updatedBy, String updatedByRole) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        // Verify project is in ACCOUNTS stage
        if (!STAGE_ACCOUNTS.equals(project.getCurrentStage())) {
            throw new RuntimeException("Accounts data can only be updated when project is in ACCOUNTS stage");
        }

        // Validate payment amount
        if (request.getAmountReceived() == null || request.getAmountReceived().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        // Create new payment transaction
        PaymentTransaction payment = PaymentTransaction.builder()
                .projectId(id)
                .amountPaid(request.getAmountReceived())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now())
                .paymentProofUrl(request.getPaymentProofUrl())
                .remarks(request.getPaymentRemarks())
                .createdBy(updatedBy)
                .build();
        
        paymentTransactionRepository.save(payment);

        // Calculate total received from all transactions
        BigDecimal totalReceived = paymentTransactionRepository.sumAmountPaidByProjectId(id);
        
        // Calculate pending amount
        BigDecimal invoiceAmount = project.getInvoiceAmount();
        BigDecimal pending = invoiceAmount.subtract(totalReceived);
        
        // Clamp pending to 0 if negative (overpayment)
        if (pending.compareTo(BigDecimal.ZERO) < 0) {
            pending = BigDecimal.ZERO;
        }

        // Update payment status based on balance
        String status;
        if (pending.compareTo(BigDecimal.ZERO) == 0) {
            status = "COMPLETED";
        } else if (totalReceived.compareTo(BigDecimal.ZERO) > 0) {
            status = "PARTIAL";
        } else {
            status = "PENDING";
        }

        // Update project with calculated values
        project.setPaymentStatus(status);
        project.setAmountReceived(totalReceived);
        project.setPendingAmount(pending);
        project.setAccountsUpdatedTimestamp(LocalDateTime.now());
        project.setLastUpdatedBy(updatedBy);
        project = projectRepository.save(project);

        logActivity(project.getId(), "PAYMENT_ADDED", null, null, null, updatedBy, updatedByRole, 
                    "Payment added: ₹" + request.getAmountReceived() + " | Total: ₹" + totalReceived + " | Pending: ₹" + pending);

        // Auto-move to INSTALLATION if payment is COMPLETED
        if ("COMPLETED".equals(status)) {
            return transitionStage(id, STAGE_INSTALLATION, "Payment completed, moving to installation", "SYSTEM", "SYSTEM", true);
        }

        return convertToDto(project);
    }

    @Transactional
    public ProjectDto updateInstallationData(Long id, UpdateInstallationDataRequest request, String updatedBy, String updatedByRole) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        // Verify project is in INSTALLATION stage
        if (!STAGE_INSTALLATION.equals(project.getCurrentStage())) {
            throw new RuntimeException("Installation data can only be updated when project is in INSTALLATION stage");
        }

        // Update installation fields
        if (request.getInstallationStatus() != null) project.setInstallationStatus(request.getInstallationStatus());
        if (request.getInstallationRemarks() != null) project.setInstallationRemarks(request.getInstallationRemarks());
        if (request.getCompletionDate() != null) project.setCompletionDate(request.getCompletionDate());

        // Auto-set completion date if marking as WORK_DONE and not already set
        if ("WORK_DONE".equals(request.getInstallationStatus()) && project.getCompletionDate() == null) {
            project.setCompletionDate(LocalDate.now());
        }

        project.setInstallationUpdatedTimestamp(LocalDateTime.now());
        project.setLastUpdatedBy(updatedBy);
        project = projectRepository.save(project);

        logActivity(project.getId(), "FIELD_UPDATED", null, null, null, updatedBy, updatedByRole, "Installation data updated");

        // Auto-move to COMPLETED if installation is WORK_DONE
        if ("WORK_DONE".equals(request.getInstallationStatus())) {
            return transitionStage(id, STAGE_COMPLETED, "Work completed", "SYSTEM", "SYSTEM", true);
        }

        return convertToDto(project);
    }

    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return convertToDto(project);
    }

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getProjectsByStage(String stage) {
        return projectRepository.findByCurrentStage(stage).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getProjectsByOwnerRole(String role) {
        return projectRepository.findByCurrentOwnerRole(role).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all projects for executive tracking view.
     * 
     * Note: Executive visibility is independent of department workflow ownership.
     * All projects are returned regardless of creator to allow full team visibility.
     * Each project includes a computed executiveViewStatus field that categorizes
     * projects into NON_ONBOARDED, ONBOARDED_ACTIVE, or COMPLETED for executive tracking.
     * 
     * @param executiveName The name of the executive (currently not used for filtering)
     * @return List of all projects with computed executive view status
     */
    public List<ProjectDto> getExecutiveProjects(String executiveName) {
        // Return ALL projects for full team visibility
        // The executiveViewStatus field is computed in convertToDto() and provides
        // the lifecycle classification for frontend tab grouping
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getSalesProjects() {
        return projectRepository.findByStages(List.of(STAGE_SALES, STAGE_ACCOUNTS)).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getAccountsProjects() {
        return projectRepository.findByCurrentStage(STAGE_ACCOUNTS).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getInstallationProjects() {
        return projectRepository.findByCurrentStage(STAGE_INSTALLATION).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getCompletedProjects() {
        return projectRepository.findByCurrentStage(STAGE_COMPLETED).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private void logActivity(Long projectId, String actionType, String fieldName, String oldValue, String newValue, 
                            String performedBy, String performedByRole, String remarks) {
        ProjectActivityLog log = ProjectActivityLog.builder()
                .projectId(projectId)
                .actionType(actionType)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .performedBy(performedBy)
                .performedByRole(performedByRole)
                .remarks(remarks)
                .build();
        activityLogRepository.save(log);
    }

    private void logStageChange(Long projectId, String fromStage, String toStage, String changedBy, 
                                String changedByRole, String remarks, boolean isSystemTriggered) {
        ProjectStageHistory history = ProjectStageHistory.builder()
                .projectId(projectId)
                .fromStage(fromStage)
                .toStage(toStage)
                .changedBy(changedBy)
                .changedByRole(changedByRole)
                .remarks(remarks)
                .isSystemTriggered(isSystemTriggered)
                .build();
        stageHistoryRepository.save(history);
    }

    private ProjectDto convertToDto(Project project) {
        // Load payment history for this project
        List<PaymentTransaction> payments = paymentTransactionRepository
                .findByProjectIdOrderByPaymentDateAsc(project.getId());
        
        // Convert to DTOs
        List<PaymentTransactionDto> paymentHistory = payments.stream()
                .map(PaymentTransactionDto::fromEntity)
                .collect(Collectors.toList());
        
        // Calculate totalReceived and pendingAmount from transactions
        BigDecimal totalReceived = paymentTransactionRepository.sumAmountPaidByProjectId(project.getId());
        BigDecimal pendingAmount = BigDecimal.ZERO;
        if (project.getInvoiceAmount() != null) {
            pendingAmount = project.getInvoiceAmount().subtract(totalReceived);
            if (pendingAmount.compareTo(BigDecimal.ZERO) < 0) {
                pendingAmount = BigDecimal.ZERO;
            }
        }
        
        // Compute executive view status from current workflow stage
        ExecutiveProjectStatus executiveViewStatus = ExecutiveProjectStatus.fromStage(project.getCurrentStage());
        
        return ProjectDto.builder()
                .id(project.getId())
                .school(project.getSchool())
                .contactPerson(project.getContactPerson())
                .contactNumber(project.getContactNumber())
                .place(project.getPlace())
                .district(project.getDistrict())
                .region(project.getRegion())
                .projectName(project.getProjectName())
                .parentCompany(project.getParentCompany())
                .executiveRemarks(project.getExecutiveRemarks())
                .createdDate(project.getCreatedDate())
                .createdBy(project.getCreatedBy())
                .currentStage(project.getCurrentStage())
                .previousStage(project.getPreviousStage())
                .stageChangeTimestamp(project.getStageChangeTimestamp())
                .stageChangedBy(project.getStageChangedBy())
                .currentOwnerRole(project.getCurrentOwnerRole())
                .executiveViewStatus(executiveViewStatus)
                .projectValue(project.getProjectValue())
                .invoiceAmount(project.getInvoiceAmount())
                .pendingDelivery(project.getPendingDelivery())
                .quotationRemarks(project.getQuotationRemarks())
                .expectedDeliveryDate(project.getExpectedDeliveryDate())
                .salesRemarks(project.getSalesRemarks())
                .salesUpdatedTimestamp(project.getSalesUpdatedTimestamp())
                .paymentStatus(project.getPaymentStatus())
                .amountReceived(project.getAmountReceived())
                .pendingAmount(pendingAmount)
                .totalReceived(totalReceived)
                .paymentHistory(paymentHistory)
                .paymentDate(project.getPaymentDate())
                .paymentRemarks(project.getPaymentRemarks())
                .paymentProofUrl(project.getPaymentProofUrl())
                .accountsUpdatedTimestamp(project.getAccountsUpdatedTimestamp())
                .installationStatus(project.getInstallationStatus())
                .installationRemarks(project.getInstallationRemarks())
                .completionDate(project.getCompletionDate())
                .installationUpdatedTimestamp(project.getInstallationUpdatedTimestamp())
                .lastUpdatedBy(project.getLastUpdatedBy())
                .lastUpdatedAt(project.getLastUpdatedAt())
                .isLocked(project.getIsLocked())
                .build();
    }

    @Transactional
    public void deleteProject(Long id, String deletedBy, String deletedByRole) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        // Only the creator can delete (or admin/super admin)
        boolean isAdmin = ROLE_ADMIN.equals(deletedByRole) || ROLE_SUPER_ADMIN.equals(deletedByRole);
        if (!project.getCreatedBy().equals(deletedBy) && !isAdmin) {
            throw new RuntimeException("Only the project creator can delete this project");
        }

        // Delete only allowed if project is not onboarded
        if (STAGE_ONBOARDED.equals(project.getCurrentStage()) ||
            STAGE_SALES.equals(project.getCurrentStage()) ||
            STAGE_ACCOUNTS.equals(project.getCurrentStage()) ||
            STAGE_INSTALLATION.equals(project.getCurrentStage()) ||
            STAGE_COMPLETED.equals(project.getCurrentStage())) {
            throw new RuntimeException("Cannot delete project that has been onboarded or is in later stages");
        }

        // Log deletion before removing
        logActivity(project.getId(), "DELETED", null, null, null, deletedBy, deletedByRole, 
                "Project deleted from " + project.getCurrentStage() + " stage");

        // Delete project
        projectRepository.delete(project);
    }
}
