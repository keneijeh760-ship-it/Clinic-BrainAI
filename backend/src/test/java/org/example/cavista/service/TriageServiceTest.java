package org.example.cavista.service;

import org.example.cavista.entity.RiskLevel;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TriageServiceTest {

    private final TriageService triage = new TriageService();

    @Test
    void redWhenFeverHigh() {
        assertThat(triage.computeRiskLevel(120, 80, 39.0, 98, "cough"))
                .isEqualTo(RiskLevel.RED);
    }

    @Test
    void redWhenSevereInComplaint() {
        assertThat(triage.computeRiskLevel(120, 80, 36.5, 98, "Severe chest pain"))
                .isEqualTo(RiskLevel.RED);
    }

    @Test
    void yellowWhenMildFever() {
        assertThat(triage.computeRiskLevel(120, 105, 37.6, 98, "tired"))
                .isEqualTo(RiskLevel.YELLOW);
    }

    @Test
    void greenWhenStable() {
        assertThat(triage.computeRiskLevel(120, 80, 36.5, 98, "mild headache"))
                .isEqualTo(RiskLevel.GREEN);
    }
}
