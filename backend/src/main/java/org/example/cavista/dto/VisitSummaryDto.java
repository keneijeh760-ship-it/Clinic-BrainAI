package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitSummaryDto {
    private Long visitId;
    private Long patientId;
    private String patientFirstName;
    private String patientLastName;
    private String qrToken;
    private LocalDateTime visitTime;
    private String chiefComplaint;
    private String riskLevel;
    private String aiSummary;
    private String locationName;
    private boolean hasOutcome;
}
