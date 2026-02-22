package org.example.cavista.service;

import org.example.cavista.dto.SymptomFlagsDto;
import org.example.cavista.dto.VitalsDto;

public interface AiSummaryService {

    String generateClinicalSummary(
            String chiefComplaint,
            VitalsDto vitals,
            SymptomFlagsDto symptoms
    );
}