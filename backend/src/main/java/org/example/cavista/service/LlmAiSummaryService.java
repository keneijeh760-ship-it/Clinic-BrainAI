package org.example.cavista.service;

import org.springframework.stereotype.Service;

/**
 * Production AI summary orchestrator.
 * Uses ClinicalPromptBuilder + AiClientService for bulletproof demo reliability.
 */
@Service
@RequiredArgsConstructor
public class LlmAiSummaryService implements AiSummaryService {

    private final ClinicalPromptBuilder promptBuilder;
    private final AiClientService aiClientService;



    @Override
    public String generateClinicalSummary(
            String chiefComplaint,
            Integer heartRate,
            Double temperature,
            Integer spo2
    ) {
        try {
            String prompt = promptBuilder.buildPrompt(chiefComplaint, heartRate, temperature, spo2);
            String response = aiClientService.callModel(prompt);

            if (response == null || response.isBlank()) {
                return fallbackSummary(chiefComplaint);
            }

            return response;
        } catch (Exception e) {
            return fallbackSummary(chiefComplaint);
        }
    }

    private String fallbackSummary(String complaint) {
        return "• Patient reports: " + (complaint != null ? complaint : "Not specified") + "\n"
                + "• Clinical review recommended.";
    }
}
