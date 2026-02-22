package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.SymptomFlagsDto;
import org.example.cavista.dto.VitalsDto;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LlmAiSummaryService implements AiSummaryService {

    private final GroqAiClient groqAiClient;
    private final ClinicalPromptBuilder promptBuilder;

    @Override
    public String generateClinicalSummary(
            String chiefComplaint,
            VitalsDto vitals,
            SymptomFlagsDto symptoms
    ) {

        try {

            String prompt = promptBuilder.buildPrompt(
                    chiefComplaint,
                    vitals,
                    symptoms
            );

            String response = groqAiClient.callModel(prompt);

            if (response == null || response.isBlank()) {
                return fallbackSummary(chiefComplaint);
            }

            return response.trim();

        } catch (Exception e) {
            return fallbackSummary(chiefComplaint);
        }
    }

    private String fallbackSummary(String complaint) {
        return "• Patient reports: " + complaint + "\n"
                + "• Clinical review recommended.";
    }
}