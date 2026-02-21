package org.example.cavista.service;

public interface AiSummaryService {

    String generateClinicalSummary(
            String chiefComplaint,
            Integer heartRate,
            Double temperature,
            Integer spo2
    );
}
