package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInstallationDataRequest {
    private String installationStatus; // PENDING, WORK_DONE, NOT_DONE
    private String installationRemarks;
    private LocalDate completionDate;
}
