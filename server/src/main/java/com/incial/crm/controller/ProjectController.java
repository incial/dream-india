package com.incial.crm.controller;

import com.incial.crm.dto.*;
import com.incial.crm.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // Executive - Create Project (Lead)
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_EXECUTIVE");
            
            ProjectDto project = projectService.createProject(request, userName, userRole);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Project created successfully")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Executive - Update Project (only in early stages)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_EXECUTIVE");
            
            ProjectDto project = projectService.updateProject(id, request, userName, userRole);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Project updated successfully")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Executive - Transition Stage
    @PostMapping("/{id}/transition")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> transitionStage(
            @PathVariable Long id,
            @RequestBody StageTransitionRequest request,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_EXECUTIVE");
            
            ProjectDto project = projectService.transitionStage(
                    id, request.getToStage(), request.getRemarks(), userName, userRole, false);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Stage transitioned successfully")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Get all projects for Executive (their own projects in early stages)
    @GetMapping("/executive")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getExecutiveProjects(Authentication authentication) {
        try {
            String userName = authentication.getName();
            List<ProjectDto> projects = projectService.getExecutiveProjects(userName);
            return ResponseEntity.ok(ApiResponse.<List<ProjectDto>>builder()
                    .success(true)
                    .message("Projects retrieved successfully")
                    .data(projects)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ProjectDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Sales Coordinator - Get projects in SALES stage
    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('SALES_COORDINATOR', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getSalesProjects() {
        try {
            List<ProjectDto> projects = projectService.getSalesProjects();
            return ResponseEntity.ok(ApiResponse.<List<ProjectDto>>builder()
                    .success(true)
                    .message("Sales projects retrieved successfully")
                    .data(projects)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ProjectDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Sales Coordinator - Update sales data
    @PutMapping("/{id}/sales")
    @PreAuthorize("hasAnyRole('SALES_COORDINATOR', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> updateSalesData(
            @PathVariable Long id,
            @RequestBody UpdateSalesDataRequest request,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_SALES_COORDINATOR");
            
            ProjectDto project = projectService.updateSalesData(id, request, userName, userRole);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Sales data updated successfully")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Sales Coordinator - Mark ready for accounts
    @PostMapping("/{id}/ready-for-accounts")
    @PreAuthorize("hasAnyRole('SALES_COORDINATOR', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> markReadyForAccounts(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_SALES_COORDINATOR");
            
            ProjectDto project = projectService.markReadyForAccounts(id, userName, userRole);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Project marked ready for accounts")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Accounts - Get projects in ACCOUNTS stage
    @GetMapping("/accounts")
    @PreAuthorize("hasAnyRole('ACCOUNTS', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAccountsProjects() {
        try {
            List<ProjectDto> projects = projectService.getAccountsProjects();
            return ResponseEntity.ok(ApiResponse.<List<ProjectDto>>builder()
                    .success(true)
                    .message("Accounts projects retrieved successfully")
                    .data(projects)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ProjectDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Accounts - Update accounts data
    @PutMapping("/{id}/accounts")
    @PreAuthorize("hasAnyRole('ACCOUNTS', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> updateAccountsData(
            @PathVariable Long id,
            @RequestBody UpdateAccountsDataRequest request,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_ACCOUNTS");
            
            ProjectDto project = projectService.updateAccountsData(id, request, userName, userRole);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Accounts data updated successfully")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Installation - Get projects in INSTALLATION stage
    @GetMapping("/installation")
    @PreAuthorize("hasAnyRole('INSTALLATION', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getInstallationProjects() {
        try {
            List<ProjectDto> projects = projectService.getInstallationProjects();
            return ResponseEntity.ok(ApiResponse.<List<ProjectDto>>builder()
                    .success(true)
                    .message("Installation projects retrieved successfully")
                    .data(projects)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ProjectDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Installation - Update installation data
    @PutMapping("/{id}/installation")
    @PreAuthorize("hasAnyRole('INSTALLATION', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> updateInstallationData(
            @PathVariable Long id,
            @RequestBody UpdateInstallationDataRequest request,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_INSTALLATION");
            
            ProjectDto project = projectService.updateInstallationData(id, request, userName, userRole);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Installation data updated successfully")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Get completed projects (Archive view)
    @GetMapping("/completed")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'SALES_COORDINATOR', 'ACCOUNTS', 'INSTALLATION', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getCompletedProjects() {
        try {
            List<ProjectDto> projects = projectService.getCompletedProjects();
            return ResponseEntity.ok(ApiResponse.<List<ProjectDto>>builder()
                    .success(true)
                    .message("Completed projects retrieved successfully")
                    .data(projects)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ProjectDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Get project by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'SALES_COORDINATOR', 'ACCOUNTS', 'INSTALLATION', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable Long id) {
        try {
            ProjectDto project = projectService.getProjectById(id);
            return ResponseEntity.ok(ApiResponse.<ProjectDto>builder()
                    .success(true)
                    .message("Project retrieved successfully")
                    .data(project)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<ProjectDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Admin/Super Admin - Get all projects
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAllProjects() {
        try {
            List<ProjectDto> projects = projectService.getAllProjects();
            return ResponseEntity.ok(ApiResponse.<List<ProjectDto>>builder()
                    .success(true)
                    .message("All projects retrieved successfully")
                    .data(projects)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ProjectDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Get projects by stage
    @GetMapping("/stage/{stage}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getProjectsByStage(@PathVariable String stage) {
        try {
            List<ProjectDto> projects = projectService.getProjectsByStage(stage);
            return ResponseEntity.ok(ApiResponse.<List<ProjectDto>>builder()
                    .success(true)
                    .message("Projects retrieved successfully")
                    .data(projects)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<ProjectDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    // Executive - Delete Project (only if not onboarded)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EXECUTIVE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String userName = authentication.getName();
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_EXECUTIVE");
            
            projectService.deleteProject(id, userName, userRole);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("Project deleted successfully")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }
}
