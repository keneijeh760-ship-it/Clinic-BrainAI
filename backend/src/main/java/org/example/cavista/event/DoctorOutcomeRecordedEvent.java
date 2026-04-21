package org.example.cavista.event;

import org.example.cavista.entity.OutcomeDecision;

/**
 * Published after a doctor records an outcome on a visit. Listeners handle
 * cache eviction and analytics.
 */
public record DoctorOutcomeRecordedEvent(
        Long outcomeId,
        Long visitId,
        String doctorStaffId,
        OutcomeDecision decision,
        /** Patient QR token — used to evict {@code patientProfile} cache entry. */
        String patientQrToken
) {}
