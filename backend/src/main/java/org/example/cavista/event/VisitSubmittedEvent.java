package org.example.cavista.event;

import org.example.cavista.dto.SymptomFlagsDto;
import org.example.cavista.dto.VitalsDto;
import org.example.cavista.entity.RiskLevel;

/**
 * Published after a visit is persisted. Downstream listeners handle async side-effects
 * (AI summary, cache eviction, analytics) so they don't block the CHEW's request.
 */
public record VisitSubmittedEvent(
        Long visitId,
        Long patientId,
        String chewStaffId,
        RiskLevel riskLevel,
        Long vitalsId,
        String chiefComplaint,
        VitalsDto vitals,
        SymptomFlagsDto symptomFlags
) {}
