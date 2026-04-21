package org.example.cavista.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cavista.repository.VisitRepository;
import org.example.cavista.service.AiSummaryService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Generates the clinical AI summary off the request thread after the visit transaction commits.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VisitAiSummaryListener {

    private final AiSummaryService aiSummaryService;
    private final VisitRepository visitRepository;

    @Async("applicationTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onVisitSubmitted(VisitSubmittedEvent event) {
        try {
            String summary = aiSummaryService.generateClinicalSummary(
                    event.chiefComplaint(),
                    event.vitals(),
                    event.symptomFlags()
            );
            visitRepository.findById(event.visitId()).ifPresent(v -> {
                v.setAiSummary(summary);
                visitRepository.save(v);
            });
        } catch (Exception ex) {
            log.warn("AI summary generation failed for visit {}: {}", event.visitId(), ex.getMessage());
        }
    }
}
