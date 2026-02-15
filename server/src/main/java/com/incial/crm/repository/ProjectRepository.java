package com.incial.crm.repository;

import com.incial.crm.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByCurrentStage(String currentStage);
    
    List<Project> findByCurrentOwnerRole(String currentOwnerRole);
    
    List<Project> findByCreatedBy(String createdBy);
    
    List<Project> findByDistrict(String district);
    
    List<Project> findByRegion(String region);
    
    List<Project> findByParentCompany(String parentCompany);
    
    @Query("SELECT p FROM Project p WHERE p.currentStage IN :stages")
    List<Project> findByStages(@Param("stages") List<String> stages);
    
    @Query("SELECT p FROM Project p WHERE p.currentStage = :stage AND p.district = :district")
    List<Project> findByStageAndDistrict(@Param("stage") String stage, @Param("district") String district);
    
    @Query("SELECT p FROM Project p WHERE p.currentStage = :stage AND p.region = :region")
    List<Project> findByStageAndRegion(@Param("stage") String stage, @Param("region") String region);
    
    @Query("SELECT p FROM Project p WHERE p.contactNumber = :contactNumber")
    Optional<Project> findByContactNumber(@Param("contactNumber") String contactNumber);
    
    @Query("SELECT p FROM Project p WHERE LOWER(p.school) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.contactPerson) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Project> searchBySchoolOrContact(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.currentStage = :stage")
    long countByStage(@Param("stage") String stage);
}
