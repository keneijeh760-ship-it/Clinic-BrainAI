package org.example.cavista.service;

import lombok.RequiredArgsConstructor;

import org.example.cavista.entity.RiskLevel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TriageService {
    public RiskLevel computeRiskLevel(Integer systolicBp,
                                  Integer heartRate,
                                  Double temperature,
                                  Integer spo2,
                                  String chiefComplaint) {
        if ((temperature != null && temperature > 38.5) ||
                (systolicBp != null && systolicBp < 90) ||
                (heartRate != null && heartRate > 120) ||
                (spo2 != null && spo2 < 92) ||
                (chiefComplaint != null &&
                        chiefComplaint.toLowerCase().contains("severe"))) {

            return RiskLevel.RED;
        }

        if ((temperature != null && temperature >= 37.5) ||
                (heartRate != null && heartRate > 100)) {

            return RiskLevel.YELLOW;
        }


        return RiskLevel.GREEN;
    }

}
