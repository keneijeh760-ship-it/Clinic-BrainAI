package org.example.cavista.event;

/**
 * Published when vitals rows are persisted for a visit (optional hook for analytics).
 */
public record VitalsCapturedEvent(
        Long visitId,
        Long vitalsId,
        Long patientId
) {}
