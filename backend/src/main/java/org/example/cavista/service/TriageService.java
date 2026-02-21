package org.example.cavista.service;

import org.example.cavista.dto.SymptomFlagsDto;
import org.example.cavista.dto.VitalsDto;
import org.example.cavista.entity.RiskLevel;
import org.springframework.stereotype.Service;

/**
 * Computes risk level from vitals thresholds and symptom flags.
 * GREEN / YELLOW / RED - powers judge "wow" moment.
 */
@Service
public class TriageService {

    private static final double HIGH_TEMP_THRESHOLD = 39.0;
    private static final double LOW_TEMP_THRESHOLD = 35.0;
    private static final int HIGH_PULSE_THRESHOLD = 120;
    private static final int LOW_PULSE_THRESHOLD = 50;
    private static final double HIGH_BP_SYSTOLIC = 180;
    private static final double LOW_BP_SYSTOLIC = 90;
    private static final double LOW_SPO2_THRESHOLD = 92;

    public RiskLevel computeRiskLevel(SymptomFlagsDto symptomFlags, VitalsDto vitals) {
        boolean hasRedFlags = hasRedSymptomFlags(symptomFlags);
        boolean hasRedVitals = hasRedVitals(vitals);

        if (hasRedFlags || hasRedVitals) {
            return RiskLevel.RED;
        }

        boolean hasYellowFlags = hasYellowSymptomFlags(symptomFlags);
        boolean hasYellowVitals = hasYellowVitals(vitals);

        if (hasYellowFlags || hasYellowVitals) {
            return RiskLevel.YELLOW;
        }

        return RiskLevel.GREEN;
    }

    private boolean hasRedSymptomFlags(SymptomFlagsDto flags) {
        if (flags == null) return false;
        return Boolean.TRUE.equals(flags.getDifficultyBreathing())
                || Boolean.TRUE.equals(flags.getChestPain())
                || Boolean.TRUE.equals(flags.getConfusion())
                || Boolean.TRUE.equals(flags.getBleeding())
                || Boolean.TRUE.equals(flags.getLossOfConsciousness())
                || Boolean.TRUE.equals(flags.getConvulsions());
    }

    private boolean hasYellowSymptomFlags(SymptomFlagsDto flags) {
        if (flags == null) return false;
        return Boolean.TRUE.equals(flags.getFever())
                || Boolean.TRUE.equals(flags.getCough())
                || Boolean.TRUE.equals(flags.getSevereHeadache())
                || Boolean.TRUE.equals(flags.getSevereDehydration());
    }

    private boolean hasRedVitals(VitalsDto v) {
        if (v == null) return false;
        if (v.getOxygenSaturation() != null && v.getOxygenSaturation() < LOW_SPO2_THRESHOLD) return true;
        if (v.getBloodPressureSystolic() != null && v.getBloodPressureSystolic() > HIGH_BP_SYSTOLIC) return true;
        if (v.getBloodPressureSystolic() != null && v.getBloodPressureSystolic() < LOW_BP_SYSTOLIC) return true;
        if (v.getTemperature() != null && v.getTemperature() > HIGH_TEMP_THRESHOLD) return true;
        if (v.getPulse() != null && (v.getPulse() > HIGH_PULSE_THRESHOLD || v.getPulse() < LOW_PULSE_THRESHOLD))
            return true;
        return false;
    }

    private boolean hasYellowVitals(VitalsDto v) {
        if (v == null) return false;
        if (v.getTemperature() != null && v.getTemperature() >= 37.5 && v.getTemperature() < HIGH_TEMP_THRESHOLD)
            return true;
        if (v.getOxygenSaturation() != null && v.getOxygenSaturation() >= 92 && v.getOxygenSaturation() < 95)
            return true;
        if (v.getPulse() != null && v.getPulse() >= 100 && v.getPulse() <= HIGH_PULSE_THRESHOLD) return true;
        return false;
    }
}
