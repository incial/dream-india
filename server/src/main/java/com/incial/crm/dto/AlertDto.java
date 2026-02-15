package com.incial.crm.dto;

import com.incial.crm.entity.ProjectAlert.AlertSeverity;
import com.incial.crm.entity.ProjectAlert.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDto {
    private Long id;
    private Long projectId;
    private String projectName;
    private AlertType alertType;
    private AlertSeverity severity;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime dismissedAt;
    private String dismissedBy;
    private Boolean isActive;
    private Integer daysOverdue;
}
