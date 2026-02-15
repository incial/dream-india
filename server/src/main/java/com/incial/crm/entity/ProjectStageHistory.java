package com.incial.crm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_stage_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStageHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "from_stage", length = 50)
    private String fromStage;

    @Column(name = "to_stage", nullable = false, length = 50)
    private String toStage;

    @Column(name = "changed_by", nullable = false, length = 255)
    private String changedBy;

    @Column(name = "changed_by_role", length = 50)
    private String changedByRole;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Builder.Default
    @Column(name = "is_system_triggered", nullable = false)
    private Boolean isSystemTriggered = false;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        if (isSystemTriggered == null) {
            isSystemTriggered = false;
        }
    }
}
