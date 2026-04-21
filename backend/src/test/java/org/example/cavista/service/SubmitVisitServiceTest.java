package org.example.cavista.service;

import org.example.cavista.dto.PatientDemographicsDto;
import org.example.cavista.dto.SubmitVisitRequest;
import org.example.cavista.entity.*;
import org.example.cavista.repository.*;
import org.example.cavista.security.AuthenticatedUserResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmitVisitServiceTest {

    @Mock PatientRepository patientRepository;
    @Mock VisitRepository visitRepository;
    @Mock VitalsRepository vitalsRepository;
    @Mock ChewPointsRepository chewPointsRepository;
    @Mock TriageService triageService;
    @Mock AuthenticatedUserResolver authenticatedUserResolver;
    @Mock ApplicationEventPublisher eventPublisher;

    SubmitVisitService service;

    @BeforeEach
    void setUp() {
        service = new SubmitVisitService(
                patientRepository,
                visitRepository,
                vitalsRepository,
                chewPointsRepository,
                triageService,
                authenticatedUserResolver,
                eventPublisher
        );
    }

    @Test
    void updatesChewPointsByStaffChewIdNotNumericId() {
        UserEntity chew = UserEntity.builder()
                .id(99L)
                .chewId("CHEW-STAFF-1")
                .email("c@x.com")
                .name("C")
                .role(UserRole.CHEW)
                .password("p")
                .build();

        when(authenticatedUserResolver.currentWithRole(UserRole.CHEW)).thenReturn(chew);
        when(triageService.computeRiskLevel(any(), any(), any(), any(), any())).thenReturn(RiskLevel.GREEN);

        PatientEntity savedPatient = PatientEntity.builder()
                .id(1L)
                .qrToken("QR-TOKEN")
                .firstName("A")
                .lastName("B")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build();
        when(patientRepository.save(any(PatientEntity.class))).thenReturn(savedPatient);

        VisitEntity savedVisit = VisitEntity.builder()
                .id(10L)
                .chew(chew)
                .patient(savedPatient)
                .chiefComplaint("x")
                .locationName("loc")
                .riskLevel(RiskLevel.GREEN)
                .build();
        when(visitRepository.save(any(VisitEntity.class))).thenReturn(savedVisit);

        when(chewPointsRepository.findByChewId("CHEW-STAFF-1")).thenReturn(Optional.empty());

        SubmitVisitRequest req = SubmitVisitRequest.builder()
                .patientDemographics(PatientDemographicsDto.builder()
                        .firstName("A")
                        .lastName("B")
                        .dateOfBirth(LocalDate.of(1990, 1, 1))
                        .build())
                .chiefComplaint("mild")
                .locationName("clinic")
                .build();

        service.submitVisit(req);

        ArgumentCaptor<ChewPointsEntity> cap = ArgumentCaptor.forClass(ChewPointsEntity.class);
        verify(chewPointsRepository).save(cap.capture());
        assertThat(cap.getValue().getChewId()).isEqualTo("CHEW-STAFF-1");
    }
}
