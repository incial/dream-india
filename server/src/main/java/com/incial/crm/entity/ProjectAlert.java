package com.incial.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity;
    
    @Column(nullable = false, length = 500)
    private String message;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime dismissedAt;
    
    @Column
    private String dismissedBy;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column
    private Integer daysOverdue;
    
    public enum AlertType {
        STAGE_INACTIVITY,
        PAYMENT_DELAY,
        INSTALLATION_DELAY,
        DUPLICATE_LEAD,
        UNAUTHORIZED_EDIT
    }
    
    public enum AlertSeverity {
        INFO,
        WARNING,
        CRITICAL
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
