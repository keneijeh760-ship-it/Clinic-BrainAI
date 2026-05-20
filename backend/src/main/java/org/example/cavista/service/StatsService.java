package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.StatsOverviewDto;
import org.example.cavista.entity.UserRole;
import org.example.cavista.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public StatsOverviewDto getOverview() {
        long visitsAwaitingReview = visitRepository.findPendingReview(Pageable.unpaged()).getTotalElements();
        return StatsOverviewDto.builder()
                .totalVisits(visitRepository.count())
                .totalPatients(patientRepository.count())
                .visitsAwaitingReview(visitsAwaitingReview)
                .totalCHEWs(userRepository.countByRole(UserRole.CHEW))
                .totalDoctors(userRepository.countByRole(UserRole.DOCTOR))
                .totalPatientAccounts(userRepository.countByRole(UserRole.PATIENT))
                .build();
    }
}
