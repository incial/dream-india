package com.incial.crm.dto;

import com.incial.crm.entity.ProjectAlert.AlertSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertSummaryDto {
    private Long totalAlerts;
    private Long criticalAlerts;
    private Long warningAlerts;
    private Long infoAlerts;
}
