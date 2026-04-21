package org.example.cavista.event;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Evicts caches after successful DB commits so readers never see stale leaderboard/profile data.
 */
@Component
public class DomainCacheEvictionListeners {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @CacheEvict(value = "leaderboard", allEntries = true)
    public void onVisitSubmitted(VisitSubmittedEvent event) {
        // annotation-driven eviction
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @CacheEvict(value = "patientProfile", key = "#p0.patientQrToken()")
    public void onDoctorOutcome(DoctorOutcomeRecordedEvent event) {
        // annotation-driven eviction
    }
}
