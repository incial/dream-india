package com.incial.crm.enums;

/**
 * Executive view classification for projects.
 * This is a derived status that groups workflow stages into executive-relevant categories.
 * It is independent of department workflow ownership.
 */
public enum ExecutiveProjectStatus {
    /**
     * Projects in early stages before being formally onboarded.
     * Includes: LEAD, ON_PROGRESS, QUOTATION_SENT, IN_REVIEW
     */
    NON_ONBOARDED,
    
    /**
     * Projects that have been onboarded but not yet completed.
     * Includes: ONBOARDED, SALES, ACCOUNTS, INSTALLATION
     */
    ONBOARDED_ACTIVE,
    
    /**
     * Projects that have been completed.
     * Includes: COMPLETED
     */
    COMPLETED;
    
    /**
     * Maps a workflow stage to its corresponding executive view status.
     * 
     * @param stage The current workflow stage of the project
     * @return The corresponding executive view status
     * @throws IllegalArgumentException if the stage is null or unrecognized
     */
    public static ExecutiveProjectStatus fromStage(String stage) {
        if (stage == null) {
            throw new IllegalArgumentException("Project stage cannot be null");
        }
        
        switch (stage.toUpperCase()) {
            // Non-onboarded stages
            case "LEAD":
            case "ON_PROGRESS":
            case "QUOTATION_SENT":
            case "IN_REVIEW":
                return NON_ONBOARDED;
            
            // Onboarded active stages
            case "ONBOARDED":
            case "SALES":
            case "ACCOUNTS":
            case "INSTALLATION":
                return ONBOARDED_ACTIVE;
            
            // Completed stage
            case "COMPLETED":
                return COMPLETED;
            
            default:
                throw new IllegalArgumentException("Unknown project stage: " + stage);
        }
    }
}
