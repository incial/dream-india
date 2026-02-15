package com.incial.crm.repository;

import com.incial.crm.entity.ProjectStageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectStageHistoryRepository extends JpaRepository<ProjectStageHistory, Long> {
    
    List<ProjectStageHistory> findByProjectIdOrderByTimestampAsc(Long projectId);
    
    List<ProjectStageHistory> findByProjectIdOrderByTimestampDesc(Long projectId);
}
