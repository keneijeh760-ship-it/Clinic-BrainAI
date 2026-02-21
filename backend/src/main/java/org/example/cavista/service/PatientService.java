package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.*;
import org.example.cavista.entity.*;
import org.example.cavista.exception.PatientNotFoundException;
import org.example.cavista.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final VitalsRepository vitalsRepository;
    private final OutcomeRepository outcomeRepository;
    private final QrCodeService qrCodeService;



    /**
     * Standalone patient registration. Visit flow can also create patients.
     */
    @Transactional
    public PatientProfileDto registerPatient(RegisterPatientRequest request) {
        PatientDemographicsDto d = request.getDemographics();
        String qrToken = generateQrToken();

        PatientEntity patient = PatientEntity.builder()
                .qrToken(qrToken)
                .firstName(d.getFirstName())
                .lastName(d.getLastName())
                .dateOfBirth(d.getDateOfBirth())
                .gender(d.getGender())
                .phoneNumber(d.getPhoneNumber())
                .address(d.getAddress())
                .createdBy(null)
                .build();

        patient = patientRepository.save(patient);

        String qrImage = qrCodeService.generateBase64Qr(patient.getQrToken());

        return PatientProfileDto.builder()
                .patientId(patient.getId())
                .qrToken(patient.getQrToken())
                .qrCodeBase64(qrImage)
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .phoneNumber(patient.getPhoneNumber())
                .address(patient.getAddress())
                .build();
    }

    /**
     * Doctor QR scan - get patient by QR token with latest visit, vitals, outcome.
     */
    public DoctorPatientViewDto getPatientByQrToken(String qrToken) {
        PatientEntity patient = patientRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new PatientNotFoundException(qrToken));

        Optional<VisitEntity> latestVisitOpt = visitRepository.findTopByPatientOrderByVisitTimeDesc(patient);

        DoctorPatientViewDto.DoctorPatientViewDtoBuilder builder = DoctorPatientViewDto.builder()
                .patientId(patient.getId())
                .qrToken(patient.getQrToken())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .phoneNumber(patient.getPhoneNumber())
                .address(patient.getAddress());

        if (latestVisitOpt.isPresent()) {
            VisitEntity visit = latestVisitOpt.get();
            builder
                    .latestVisitId(visit.getId())
                    .visitTime(visit.getVisitTime())
                    .chiefComplaint(visit.getChiefComplaint())
                    .riskLevel(visit.getRiskLevel() != null ? visit.getRiskLevel().name() : null)
                    .aiSummary(visit.getAiSummary())
                    .locationName(visit.getLocationName());

            vitalsRepository.findByVisit_Id(visit.getId())
                    .ifPresent(v -> builder.vitals(VitalsDto.builder()
                            .bloodPressureSystolic(v.getBloodPressureSystolic())
                            .bloodPressureDiastolic(v.getBloodPressureDiastolic())
                            .temperature(v.getTemperature())
                            .pulse(v.getPulse())
                            .respiratoryRate(v.getRespiratoryRate())
                            .oxygenSaturation(v.getOxygenSaturation())
                            .build()));

            outcomeRepository.findByVisit_Id(visit.getId())
                    .ifPresent(o -> builder.outcome(OutcomeDto.builder()
                            .id(o.getId())
                            .decision(o.getDecision().name())
                            .note(o.getNote())
                            .recordedAt(o.getRecordedAt())
                            .build()));
        }

        return builder.build();
    }

    private String generateQrToken() {
        return "QR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }
}
