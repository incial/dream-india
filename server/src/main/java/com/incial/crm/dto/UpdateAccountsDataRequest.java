package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountsDataRequest {
    private String paymentStatus; // PENDING, PARTIAL, COMPLETED
    private BigDecimal amountReceived;
    private BigDecimal pendingAmount;
    private LocalDate paymentDate;
    private String paymentRemarks;
    private String paymentProofUrl;
}
