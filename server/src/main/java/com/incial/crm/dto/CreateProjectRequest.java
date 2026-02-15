package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {
    @NotBlank(message = "School name is required")
    private String school;
    
    private String contactPerson;
    
    private String contactNumber;
    
    private String place;
    
    private String district;
    
    private String region; // North / South
    
    private String projectName;
    
    private String parentCompany;
    
    private String executiveRemarks;
}
