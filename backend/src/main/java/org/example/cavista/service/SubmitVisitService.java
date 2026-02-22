package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.*;
import org.example.cavista.entity.*;
import org.example.cavista.exception.*;
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
        UserEntity chew = userRepository.findById(request.getChewId())
                .orElseThrow(() -> new UserNotFoundException(request.getChewId()));

        if (chew.getRole() != UserRole.CHEW) {
            throw new InvalidChewRoleException(
                    "User is not authorized as CHEW: " + chew.getId()
            );
        }
        PatientEntity patient;
        boolean isNewPatient;

        if (request.getPatientId() != null) {

            patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

            isNewPatient = false;

        } else {

            if (request.getPatientDemographics() == null) {
                throw new InvalidVisitRequestException(
                        "patientDemographics required when patientId is not provided"
                );
            }

            patient = createNewPatient(request.getPatientDemographics(), chew);
            patient = patientRepository.save(patient);
            isNewPatient = true;
        }

        VisitEntity visit = VisitEntity.builder()
                .chew(chew)
                .patient(patient)
                .visitTime(LocalDateTime.now())
                .chiefComplaint(request.getChiefComplaint())
                .locationName(request.getLocationName())
                .build();
        Integer systolicBp = null;
        Integer heartRate = null;
        Double temperature = null;
        Integer spo2 = null;

        if (request.getVitals() != null) {
            VitalsDto v = request.getVitals();

            systolicBp = v.getBloodPressureSystolic() != null
                    ? v.getBloodPressureSystolic().intValue()
                    : null;

            heartRate = v.getPulse();
            temperature = v.getTemperature();

            spo2 = v.getOxygenSaturation() != null
                    ? v.getOxygenSaturation().intValue()
                    : null;
        }

        RiskLevel riskLevel = triageService.computeRiskLevel(
                systolicBp,
                heartRate,
                temperature,
                spo2,
                request.getChiefComplaint()
        );

        visit.setRiskLevel(riskLevel);

        String aiSummary = aiSummaryService.generateClinicalSummary(
                request.getChiefComplaint(),
                request.getVitals(),
                request.getSymptomFlags()
        );

        visit.setAiSummary(aiSummary);
        visit = visitRepository.save(visit);

        if (request.getVitals() != null) {
            VitalsEntity vitals = mapToVitalsEntity(request.getVitals(), visit);
            vitalsRepository.save(vitals);
        }

        int pointsEarned = calculatePoints(isNewPatient);
        updateChewPoints(chew.getId(), pointsEarned, isNewPatient);

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
        return "QR-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 16)
                .toUpperCase();
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

    private void updateChewPoints(Long chewUserId, int pointsToAdd, boolean newPatientCaptured) {

        ChewPointsEntity points = chewPointsRepository.findByChewId(chewUserId)
                .orElse(
                        ChewPointsEntity.builder()
                                .chewId(chewUserId)
                                .totalPoints(0)
                                .totalPatientsCaptured(0)
                                .build()
                );

        points.setTotalPoints(points.getTotalPoints() + pointsToAdd);

        if (newPatientCaptured) {
            points.setTotalPatientsCaptured(points.getTotalPatientsCaptured() + 1);
        }

        chewPointsRepository.save(points);
    }
}