package org.example.cavista.service;

import org.example.cavista.dto.*;
import org.example.cavista.entity.*;
import org.example.cavista.exception.ChewNotFoundException;
import org.example.cavista.exception.InvalidChewRoleException;
import org.example.cavista.exception.InvalidVisitRequestException;
import org.example.cavista.exception.PatientNotFoundException;
import org.example.cavista.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class SubmitVisitService {

    private static final int POINTS_PER_VISIT = 10;
    private static final int BONUS_POINTS_NEW_PATIENT = 15;

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final VitalsRepository vitalsRepository;
    private final ChewPointsRepository chewPointsRepository;
    private final TriageService triageService;
    private final AiSummaryService aiSummaryService;

    @Transactional
    public SubmitVisitResponse submitVisit(SubmitVisitRequest request) {
        // Step 3 — Validate CHEW first
        UserEntity chew = userRepository.findByChewId(request.getChewId())
                .orElseThrow(() -> new ChewNotFoundException(request.getChewId()));

        if (chew.getRole() != UserRole.CHEW) {
            throw new InvalidChewRoleException(request.getChewId());
        }

        // Step 4 — Resolve patient
        PatientEntity patient;
        boolean isNewPatient;

        if (request.getPatientId() != null) {
            patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
            isNewPatient = false;
        } else {
            if (request.getPatientDemographics() == null) {
                throw new InvalidVisitRequestException("patientDemographics required when patientId is not provided");
            }
            patient = createNewPatient(request.getPatientDemographics(), chew);
            patient = patientRepository.save(patient);
            isNewPatient = true;
        }

        // Step 5 — Build visit (incomplete)
        VisitEntity visit = VisitEntity.builder()
                .chew(chew)
                .patient(patient)
                .visitTime(LocalDateTime.now())
                .chiefComplaint(request.getChiefComplaint())
                .locationName(request.getLocationName())
                .build();

        // Step 6 — Run triage logic
        RiskLevel riskLevel = triageService.computeRiskLevel(request.getSymptomFlags(), request.getVitals());
        visit.setRiskLevel(riskLevel);

        // Step 7 — Generate AI summary (via LlmAiSummaryService)
        Integer heartRate = request.getVitals() != null ? request.getVitals().getPulse() : null;
        Double temperature = request.getVitals() != null ? request.getVitals().getTemperature() : null;
        Integer spo2 = request.getVitals() != null && request.getVitals().getOxygenSaturation() != null
                ? request.getVitals().getOxygenSaturation().intValue() : null;

        String aiSummary = aiSummaryService.generateClinicalSummary(
                request.getChiefComplaint(),
                heartRate,
                temperature,
                spo2
        );
        visit.setAiSummary(aiSummary);

        // Step 8 — Persist visit
        visit = visitRepository.save(visit);

        // Step 9 — Save vitals (if provided)
        if (request.getVitals() != null) {
            VitalsEntity vitals = mapToVitalsEntity(request.getVitals(), visit);
            vitalsRepository.save(vitals);
        }

        // Step 10 — Update CHEW points
        int pointsEarned = calculatePoints(isNewPatient);
        updateChewPoints(request.getChewId(), pointsEarned, isNewPatient);

        // Step 11 — Build response DTO
        return SubmitVisitResponse.builder()
                .patientId(patient.getId())
                .qrToken(patient.getQrToken())
                .riskLevel(riskLevel.name())
                .aiSummary(aiSummary)
                .visitId(visit.getId())
                .pointsEarned(pointsEarned)
                .build();
    }

    private PatientEntity createNewPatient(PatientDemographicsDto dto, UserEntity createdBy) {
        return PatientEntity.builder()
                .qrToken(generateQrToken())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .createdBy(createdBy)
                .build();
    }

    private String generateQrToken() {
        return "QR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private VitalsEntity mapToVitalsEntity(VitalsDto dto, VisitEntity visit) {
        return VitalsEntity.builder()
                .visit(visit)
                .bloodPressureSystolic(dto.getBloodPressureSystolic())
                .bloodPressureDiastolic(dto.getBloodPressureDiastolic())
                .temperature(dto.getTemperature())
                .pulse(dto.getPulse())
                .respiratoryRate(dto.getRespiratoryRate())
                .oxygenSaturation(dto.getOxygenSaturation())
                .build();
    }

    private int calculatePoints(boolean isNewPatient) {
        return POINTS_PER_VISIT + (isNewPatient ? BONUS_POINTS_NEW_PATIENT : 0);
    }

    private void updateChewPoints(String chewId, int pointsToAdd, boolean newPatientCaptured) {
        ChewPointsEntity points = chewPointsRepository.findByChewId(chewId)
                .orElse(ChewPointsEntity.builder()
                        .chewId(chewId)
                        .totalPoints(0)
                        .totalPatientsCaptured(0)
                        .build());

        points.setTotalPoints(points.getTotalPoints() + pointsToAdd);
        if (newPatientCaptured) {
            points.setTotalPatientsCaptured(points.getTotalPatientsCaptured() + 1);
        }

        chewPointsRepository.save(points);
    }
}
