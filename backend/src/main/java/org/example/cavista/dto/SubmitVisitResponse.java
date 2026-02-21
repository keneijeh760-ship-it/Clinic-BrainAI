package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitVisitResponse {
    private Long patientId;
    private String qrToken;
    private String riskLevel;
    private String aiSummary;
    private Long visitId;
    private int pointsEarned;
    private String qrCodeBase64;
}
