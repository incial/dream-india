package com.incial.crm.repository;

import com.incial.crm.entity.ProjectActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectActivityLogRepository extends JpaRepository<ProjectActivityLog, Long> {
    
    List<ProjectActivityLog> findByProjectIdOrderByTimestampDesc(Long projectId);
    
    @Query("SELECT pal FROM ProjectActivityLog pal WHERE pal.projectId = :projectId AND pal.actionType = :actionType ORDER BY pal.timestamp DESC")
    List<ProjectActivityLog> findByProjectIdAndActionType(@Param("projectId") Long projectId, @Param("actionType") String actionType);
    
    @Query("SELECT pal FROM ProjectActivityLog pal WHERE pal.performedBy = :performedBy ORDER BY pal.timestamp DESC")
    List<ProjectActivityLog> findByPerformedBy(@Param("performedBy") String performedBy);
}
