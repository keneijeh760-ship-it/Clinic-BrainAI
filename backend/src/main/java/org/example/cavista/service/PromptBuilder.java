package org.example.cavista.Services;

public class PromptBuilder {
    public String buildPrompt(
            String chiefComplaint,
            Integer heartRate,
            Double temperature,
            Integer spo2
    ){
        return """
                You are a clinical triage assistant helping Nigerian doctors.
                Provide a short clinical summary in 3–5 bullet points.

                Rules:
                - Do NOT prescribe medications
                - Do NOT give dosages
                - Do NOT make definitive diagnoses
                - Be concise and clinical

                Patient Data:
                Chief Complaint: %s
                Heart Rate: %s
                Temperature: %s
                SpO2: %s
                """.formatted(
                chiefComplaint,
                heartRate,
                temperature,
                spo2);
    }
}
