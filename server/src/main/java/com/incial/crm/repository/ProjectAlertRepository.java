package com.incial.crm.repository;

import com.incial.crm.entity.ProjectAlert;
import com.incial.crm.entity.ProjectAlert.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectAlertRepository extends JpaRepository<ProjectAlert, Long> {
    
    List<ProjectAlert> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<ProjectAlert> findByProjectIdAndIsActiveTrue(Long projectId);
    
    List<ProjectAlert> findByAlertTypeAndIsActiveTrue(AlertType alertType);
    
    @Query("SELECT COUNT(a) FROM ProjectAlert a WHERE a.isActive = true AND a.severity = :severity")
    Long countActiveBySeverity(@Param("severity") ProjectAlert.AlertSeverity severity);
    
    @Query("SELECT COUNT(a) FROM ProjectAlert a WHERE a.isActive = true")
    Long countActiveAlerts();
    
    @Query("SELECT a FROM ProjectAlert a WHERE a.project.id = :projectId AND a.alertType = :alertType AND a.isActive = true")
    List<ProjectAlert> findActiveAlertsByProjectAndType(@Param("projectId") Long projectId, @Param("alertType") AlertType alertType);
}
