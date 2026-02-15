package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private Long id;
    
    // Base Information
    private String school;
    private String contactPerson;
    private String contactNumber;
    private String place;
    private String district;
    private String region;
    private String projectName;
    private String parentCompany;
    private String executiveRemarks;
    private LocalDateTime createdDate;
    private String createdBy;
    
    // Stage Tracking
    private String currentStage;
    private String previousStage;
    private LocalDateTime stageChangeTimestamp;
    private String stageChangedBy;
    private String currentOwnerRole;
    
    // Sales Data
    private BigDecimal projectValue;
    private BigDecimal invoiceAmount;
    private String pendingDelivery;
    private String quotationRemarks;
    private LocalDate expectedDeliveryDate;
    private String salesRemarks;
    private LocalDateTime salesUpdatedTimestamp;
    
    // Accounts Data
    private String paymentStatus;
    private BigDecimal amountReceived;
    private BigDecimal pendingAmount;
    private LocalDate paymentDate;
    private String paymentRemarks;
    private String paymentProofUrl;
    private LocalDateTime accountsUpdatedTimestamp;
    
    // Installation Data
    private String installationStatus;
    private String installationRemarks;
    private LocalDate completionDate;
    private LocalDateTime installationUpdatedTimestamp;
    
    // Audit
    private String lastUpdatedBy;
    private LocalDateTime lastUpdatedAt;
    private Boolean isLocked;
}
