package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialSummaryDto {
    private Double totalRevenue;
    private Double completedRevenue;
    private Double pendingRevenue;
    private Double totalReceived;
    private Double totalPending;
    private Double totalCost;
    private Double estimatedProfit;
    private Double profitMargin;
}
