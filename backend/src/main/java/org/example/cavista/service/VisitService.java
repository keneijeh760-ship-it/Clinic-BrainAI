package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.*;
import org.example.cavista.entity.*;
import org.example.cavista.exception.VisitNotFoundException;
import org.example.cavista.repository.*;
import org.example.cavista.security.AuthenticatedUserResolver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final VitalsRepository vitalsRepository;
    private final OutcomeRepository outcomeRepository;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    /** Single visit detail — CHEW/DOCTOR/ADMIN/PATIENT scoped access. */
    public VisitDetailDto getVisitById(Long visitId) {
        VisitEntity visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new VisitNotFoundException(visitId));
        return toDetail(visit);
    }

    /** CHEW: visits they submitted. */
    public Page<VisitSummaryDto> getMyVisits(Pageable pageable) {
        UserEntity chew = authenticatedUserResolver.currentWithRole(UserRole.CHEW);
        return visitRepository.findByChewOrderByVisitTimeDesc(chew, pageable)
                .map(this::toSummary);
    }

    /** Visits without a doctor outcome — visible to CHEW and DOCTOR. */
    public Page<VisitSummaryDto> getPendingReview(Pageable pageable) {
        return visitRepository.findPendingReview(pageable).map(this::toSummary);
    }

    /** Patient portal: visits for the linked patient. */
    public Page<VisitSummaryDto> getVisitsForPatient(PatientEntity patient, Pageable pageable) {
        return visitRepository.findByPatientOrderByVisitTimeDesc(patient, pageable)
                .map(this::toSummary);
    }

    // ── mappers ────────────────────────────────────────────────────────────────

    private VisitSummaryDto toSummary(VisitEntity v) {
        return VisitSummaryDto.builder()
                .visitId(v.getId())
                .patientId(v.getPatient().getId())
                .patientFirstName(v.getPatient().getFirstName())
                .patientLastName(v.getPatient().getLastName())
                .qrToken(v.getPatient().getQrToken())
                .visitTime(v.getVisitTime())
                .chiefComplaint(v.getChiefComplaint())
                .riskLevel(v.getRiskLevel() != null ? v.getRiskLevel().name() : null)
                .aiSummary(v.getAiSummary())
                .locationName(v.getLocationName())
                .hasOutcome(outcomeRepository.existsByVisit_Id(v.getId()))
                .build();
    }

    private VisitDetailDto toDetail(VisitEntity v) {
        VisitDetailDto.VisitDetailDtoBuilder b = VisitDetailDto.builder()
                .visitId(v.getId())
                .patientId(v.getPatient().getId())
                .patientFirstName(v.getPatient().getFirstName())
                .patientLastName(v.getPatient().getLastName())
                .qrToken(v.getPatient().getQrToken())
                .visitTime(v.getVisitTime())
                .chiefComplaint(v.getChiefComplaint())
                .riskLevel(v.getRiskLevel() != null ? v.getRiskLevel().name() : null)
                .aiSummary(v.getAiSummary())
                .locationName(v.getLocationName())
                .symptomFlags(buildSymptomFlags(v));

        vitalsRepository.findByVisit_Id(v.getId())
                .ifPresent(vit -> b.vitals(VitalsDto.builder()
                        .bloodPressureSystolic(vit.getBloodPressureSystolic())
                        .bloodPressureDiastolic(vit.getBloodPressureDiastolic())
                        .temperature(vit.getTemperature())
                        .pulse(vit.getPulse())
                        .respiratoryRate(vit.getRespiratoryRate())
                        .oxygenSaturation(vit.getOxygenSaturation())
                        .build()));

        outcomeRepository.findByVisit_Id(v.getId())
                .ifPresent(o -> b.outcome(OutcomeDto.builder()
                        .id(o.getId())
                        .decision(o.getDecision().name())
                        .note(o.getNote())
                        .recordedAt(o.getRecordedAt())
                        .build()));

        return b.build();
    }

    private SymptomFlagsDto buildSymptomFlags(VisitEntity v) {
        if (v.getSymptomFever() == null && v.getSymptomCough() == null) return null;
        return SymptomFlagsDto.builder()
                .fever(v.getSymptomFever())
                .cough(v.getSymptomCough())
                .difficultyBreathing(v.getSymptomDifficultyBreathing())
                .chestPain(v.getSymptomChestPain())
                .severeHeadache(v.getSymptomSevereHeadache())
                .confusion(v.getSymptomConfusion())
                .bleeding(v.getSymptomBleeding())
                .lossOfConsciousness(v.getSymptomLossOfConsciousness())
                .severeDehydration(v.getSymptomSevereDehydration())
                .convulsions(v.getSymptomConvulsions())
                .build();
    }
}
