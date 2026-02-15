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
public class UpdateSalesDataRequest {
    private BigDecimal projectValue;
    private BigDecimal invoiceAmount;
    private String pendingDelivery;
    private String quotationRemarks;
    private LocalDate expectedDeliveryDate;
    private String salesRemarks;
}
