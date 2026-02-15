package com.incial.crm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Base Information (Created by Executive)
    @Column(nullable = false, length = 255)
    private String school;

    @Column(name = "contact_person", length = 255)
    private String contactPerson;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(length = 255)
    private String place;

    @Column(length = 255)
    private String district;

    @Column(length = 50)
    private String region; // North / South

    @Column(name = "project_name", length = 500)
    private String projectName;

    @Column(name = "parent_company", length = 255)
    private String parentCompany;

    @Column(name = "executive_remarks", columnDefinition = "TEXT")
    private String executiveRemarks;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    // Stage Tracking Fields
    @Column(name = "current_stage", nullable = false, length = 50)
    private String currentStage; // LEAD, ON_PROGRESS, QUOTATION_SENT, IN_REVIEW, ONBOARDED, SALES, ACCOUNTS, INSTALLATION, COMPLETED

    @Column(name = "previous_stage", length = 50)
    private String previousStage;

    @Column(name = "stage_change_timestamp")
    private LocalDateTime stageChangeTimestamp;

    @Column(name = "stage_changed_by", length = 255)
    private String stageChangedBy;

    @Column(name = "current_owner_role", length = 50)
    private String currentOwnerRole; // EXECUTIVE, SALES, ACCOUNTS, INSTALLATION

    // Sales Data Fields
    @Column(name = "project_value", precision = 15, scale = 2)
    private BigDecimal projectValue;

    @Column(name = "invoice_amount", precision = 15, scale = 2)
    private BigDecimal invoiceAmount;

    @Column(name = "pending_delivery", columnDefinition = "TEXT")
    private String pendingDelivery;

    @Column(name = "quotation_remarks", columnDefinition = "TEXT")
    private String quotationRemarks;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "sales_remarks", columnDefinition = "TEXT")
    private String salesRemarks;

    @Column(name = "sales_updated_timestamp")
    private LocalDateTime salesUpdatedTimestamp;

    // Accounts Data Fields
    @Column(name = "payment_status", length = 50)
    private String paymentStatus; // PENDING, PARTIAL, COMPLETED

    @Column(name = "amount_received", precision = 15, scale = 2)
    private BigDecimal amountReceived;

    @Column(name = "pending_amount", precision = 15, scale = 2)
    private BigDecimal pendingAmount;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payment_remarks", columnDefinition = "TEXT")
    private String paymentRemarks;

    @Column(name = "payment_proof_url", columnDefinition = "TEXT")
    private String paymentProofUrl;

    @Column(name = "accounts_updated_timestamp")
    private LocalDateTime accountsUpdatedTimestamp;

    // Installation Data Fields
    @Column(name = "installation_status", length = 50)
    private String installationStatus; // PENDING, WORK_DONE, NOT_DONE

    @Column(name = "installation_remarks", columnDefinition = "TEXT")
    private String installationRemarks;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "installation_updated_timestamp")
    private LocalDateTime installationUpdatedTimestamp;

    // Audit Fields
    @Column(name = "last_updated_by", length = 255)
    private String lastUpdatedBy;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @Builder.Default
    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        lastUpdatedAt = LocalDateTime.now();
        if (currentStage == null) {
            currentStage = "LEAD";
        }
        if (currentOwnerRole == null) {
            currentOwnerRole = "EXECUTIVE";
        }
        if (isLocked == null) {
            isLocked = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdatedAt = LocalDateTime.now();
    }
}
