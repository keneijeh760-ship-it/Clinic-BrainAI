package org.example.cavista.service;

import org.example.cavista.dto.SymptomFlagsDto;
import org.example.cavista.dto.VitalsDto;
import org.springframework.stereotype.Component;

/**
 * Builds structured clinical prompts for the LLM.
 */
@Component
public class ClinicalPromptBuilder {

    public String buildPrompt(
            String chiefComplaint,
            VitalsDto vitals,
            SymptomFlagsDto symptoms
    ) {

        String tempText = flagTemperature(
                vitals != null ? vitals.getTemperature() : null);

        String pulseText = flagPulse(
                vitals != null ? vitals.getPulse() : null);

        String spo2Text = flagSpo2(
                vitals != null ? vitals.getOxygenSaturation() : null);

        return """
You are an experienced clinical triage assistant supporting frontline Nigerian healthcare workers.

TASK:
Provide a concise clinical triage summary in 3–5 bullet points.

IMPORTANT RULES:
- Do NOT prescribe medications
- Do NOT provide drug dosages
- Do NOT make definitive diagnoses
- Focus on clinical observations and urgency
- Use professional medical tone

PATIENT PRESENTATION:
Chief Complaint: %s

VITAL SIGNS:
- Temperature: %s
- Pulse: %s
- Oxygen Saturation: %s
- Respiratory Rate: %s
- Blood Pressure: %s / %s

SYMPTOM FLAGS:
- Fever: %s
- Cough: %s
- Difficulty Breathing: %s
- Chest Pain: %s
- Severe Headache: %s
- Confusion: %s
- Bleeding: %s
- Loss of Consciousness: %s
- Severe Dehydration: %s
- Convulsions: %s

OUTPUT FORMAT:
• Bullet points only  
• Highlight any red flags  
• Comment on abnormal vitals  
• Suggest urgency level (Low / Moderate / High)

Begin.
""".formatted(
                safe(chiefComplaint),

                tempText,
                pulseText,
                spo2Text,

                vitals != null ? safe(vitals.getRespiratoryRate()) : "not recorded",
                vitals != null ? safe(vitals.getBloodPressureSystolic()) : "not recorded",
                vitals != null ? safe(vitals.getBloodPressureDiastolic()) : "not recorded",

                flag(symptoms, SymptomFlagsDto::getFever),
                flag(symptoms, SymptomFlagsDto::getCough),
                flag(symptoms, SymptomFlagsDto::getDifficultyBreathing),
                flag(symptoms, SymptomFlagsDto::getChestPain),
                flag(symptoms, SymptomFlagsDto::getSevereHeadache),
                flag(symptoms, SymptomFlagsDto::getConfusion),
                flag(symptoms, SymptomFlagsDto::getBleeding),
                flag(symptoms, SymptomFlagsDto::getLossOfConsciousness),
                flag(symptoms, SymptomFlagsDto::getSevereDehydration),
                flag(symptoms, SymptomFlagsDto::getConvulsions)
        );
    }

    // =========================
    // Helpers
    // =========================

    private String safe(Object value) {
        return value == null ? "not recorded" : value.toString();
    }

    private String flag(
            SymptomFlagsDto dto,
            java.util.function.Function<SymptomFlagsDto, Boolean> getter
    ) {
        if (dto == null) return "not reported";
        Boolean val = getter.apply(dto);
        return Boolean.TRUE.equals(val) ? "present" : "absent";
    }

    // =========================
    // Clinical abnormality flags
    // =========================

    private String flagTemperature(Double temp) {
        if (temp == null) return "not recorded";
        if (temp >= 38.5) return temp + "°C (high fever)";
        if (temp >= 37.5) return temp + "°C (mild fever)";
        return temp + "°C (normal range)";
    }

    private String flagPulse(Integer pulse) {
        if (pulse == null) return "not recorded";
        if (pulse > 120) return pulse + " bpm (tachycardia)";
        if (pulse < 50) return pulse + " bpm (bradycardia)";
        return pulse + " bpm (within normal range)";
    }

    private String flagSpo2(Double spo2) {
        if (spo2 == null) return "not recorded";
        if (spo2 < 92) return spo2 + "% (hypoxia)";
        if (spo2 < 95) return spo2 + "% (borderline)";
        return spo2 + "% (normal oxygenation)";
    }
}