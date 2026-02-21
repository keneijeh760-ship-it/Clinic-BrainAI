package org.example.cavista.service;

import org.example.cavista.dto.OutcomeDto;
import org.example.cavista.dto.RecordOutcomeRequest;
import org.example.cavista.entity.*;
import org.example.cavista.exception.ChewNotFoundException;
import org.example.cavista.exception.InvalidChewRoleException;
import org.example.cavista.exception.VisitNotFoundException;
import org.example.cavista.repository.OutcomeRepository;
import org.example.cavista.repository.UserRepository;
import org.example.cavista.repository.VisitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutcomeService {

    private final OutcomeRepository outcomeRepository;
    private final VisitRepository visitRepository;
    private final UserRepository userRepository;

    public OutcomeService(OutcomeRepository outcomeRepository,
                          VisitRepository visitRepository,
                          UserRepository userRepository) {
        this.outcomeRepository = outcomeRepository;
        this.visitRepository = visitRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OutcomeDto recordOutcome(RecordOutcomeRequest request) {
        UserEntity doctor = userRepository.findByChewId(request.getDoctorChewId())
                .orElseThrow(() -> new ChewNotFoundException(request.getDoctorChewId()));

        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new InvalidChewRoleException("User must be a doctor to record outcomes: " + request.getDoctorChewId());
        }

        VisitEntity visit = visitRepository.findById(request.getVisitId())
                .orElseThrow(() -> new VisitNotFoundException(request.getVisitId()));

        OutcomeDecision decision = OutcomeDecision.valueOf(request.getDecision().toUpperCase());

        OutcomeEntity outcome = OutcomeEntity.builder()
                .visit(visit)
                .doctor(doctor)
                .decision(decision)
                .note(request.getNote())
                .build();

        outcome = outcomeRepository.save(outcome);

        return OutcomeDto.builder()
                .id(outcome.getId())
                .decision(outcome.getDecision().name())
                .note(outcome.getNote())
                .recordedAt(outcome.getRecordedAt())
                .build();
    }
}
