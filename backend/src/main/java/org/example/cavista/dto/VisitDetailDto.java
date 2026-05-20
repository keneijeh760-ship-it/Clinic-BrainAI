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
public class VisitDetailDto {
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
    private VitalsDto vitals;
    private SymptomFlagsDto symptomFlags;
    private OutcomeDto outcome;
}
