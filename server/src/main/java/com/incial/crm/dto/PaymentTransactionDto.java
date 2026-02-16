package com.incial.crm.dto;

import com.incial.crm.entity.PaymentTransaction;
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
public class PaymentTransactionDto {
    
    private Long id;
    private Long projectId;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
    private String paymentProofUrl;
    private String remarks;
    private LocalDateTime createdAt;
    private String createdBy;
    
    /**
     * Convert entity to DTO
     */
    public static PaymentTransactionDto fromEntity(PaymentTransaction entity) {
        if (entity == null) {
            return null;
        }
        
        return PaymentTransactionDto.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .amountPaid(entity.getAmountPaid())
                .paymentDate(entity.getPaymentDate())
                .paymentProofUrl(entity.getPaymentProofUrl())
                .remarks(entity.getRemarks())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .build();
    }
    
    /**
     * Convert DTO to entity
     */
    public PaymentTransaction toEntity() {
        return PaymentTransaction.builder()
                .id(this.id)
                .projectId(this.projectId)
                .amountPaid(this.amountPaid)
                .paymentDate(this.paymentDate)
                .paymentProofUrl(this.paymentProofUrl)
                .remarks(this.remarks)
                .createdAt(this.createdAt)
                .createdBy(this.createdBy)
                .build();
    }
}
