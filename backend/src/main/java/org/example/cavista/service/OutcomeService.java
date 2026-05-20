package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.OutcomeDto;
import org.example.cavista.dto.RecordOutcomeRequest;
import org.example.cavista.entity.*;
import org.example.cavista.event.DoctorOutcomeRecordedEvent;
import org.example.cavista.exception.DuplicateOutcomeException;
import org.example.cavista.exception.VisitNotFoundException;
import org.example.cavista.repository.OutcomeRepository;
import org.example.cavista.repository.VisitRepository;
import org.example.cavista.security.AuthenticatedUserResolver;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OutcomeService {

    private final OutcomeRepository outcomeRepository;
    private final VisitRepository visitRepository;
    private final AuthenticatedUserResolver authenticatedUserResolver;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public OutcomeDto recordOutcome(RecordOutcomeRequest request) {
        UserEntity doctor = authenticatedUserResolver.currentWithRole(UserRole.DOCTOR);

        VisitEntity visit = visitRepository.findById(request.getVisitId())
                .orElseThrow(() -> new VisitNotFoundException(request.getVisitId()));

        if (outcomeRepository.existsByVisit_Id(visit.getId())) {
            throw new DuplicateOutcomeException(visit.getId());
        }

        OutcomeDecision decision;
        try {
            decision = OutcomeDecision.valueOf(request.getDecision().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid decision: " + request.getDecision()
                            + ". Expected one of: ADMIT, REFER, DISCHARGE"
            );
        }

        OutcomeEntity outcome = OutcomeEntity.builder()
                .visit(visit)
                .doctor(doctor)
                .decision(decision)
                .note(request.getNote())
                .build();

        outcome = outcomeRepository.save(outcome);

        String patientQr = visit.getPatient().getQrToken();
        eventPublisher.publishEvent(new DoctorOutcomeRecordedEvent(
                outcome.getId(),
                visit.getId(),
                doctor.getChewId(),
                decision,
                patientQr
        ));

        return toDto(outcome);
    }

    public Page<OutcomeDto> getMyOutcomes(Pageable pageable) {
        UserEntity doctor = authenticatedUserResolver.currentWithRole(UserRole.DOCTOR);
        return outcomeRepository.findByDoctorOrderByRecordedAtDesc(doctor, pageable)
                .map(this::toDto);
    }

    private OutcomeDto toDto(OutcomeEntity o) {
        return OutcomeDto.builder()
                .id(o.getId())
                .decision(o.getDecision().name())
                .note(o.getNote())
                .recordedAt(o.getRecordedAt())
                .build();
    }
}
