package com.incial.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {
    private String month;
    private Integer year;
    private Long projectCount;
    private Double revenue;
    private Long completedCount;
}
