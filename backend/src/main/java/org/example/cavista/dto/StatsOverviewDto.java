package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsOverviewDto {
    private long totalVisits;
    private long totalPatients;
    private long visitsAwaitingReview;
    private long totalCHEWs;
    private long totalDoctors;
    private long totalPatientAccounts;
}
