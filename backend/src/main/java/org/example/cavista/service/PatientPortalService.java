package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.*;
import org.example.cavista.entity.*;
import org.example.cavista.repository.VisitRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientPortalService {

    private final PatientService patientService;
    private final VisitService visitService;
    private final QrCodeService qrCodeService;
    private final VisitRequestRepository visitRequestRepository;

    public PatientProfileDto getMyProfile() {
        PatientEntity patient = patientService.resolveCurrentPatient();
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
                .paymentOptions(patient.getPaymentOptions())
                .build();
    }

    @Transactional
    public PatientProfileDto updateMyProfile(UpdatePatientProfileRequest req) {
        PatientEntity patient = patientService.resolveCurrentPatient();
        if (req.getPhoneNumber() != null) patient.setPhoneNumber(req.getPhoneNumber());
        if (req.getAddress() != null) patient.setAddress(req.getAddress());
        return getMyProfile();
    }

    public Page<VisitSummaryDto> getMyVisits(Pageable pageable) {
        PatientEntity patient = patientService.resolveCurrentPatient();
        return visitService.getVisitsForPatient(patient, pageable);
    }

    public VisitDetailDto getMyVisit(Long visitId) {
        PatientEntity patient = patientService.resolveCurrentPatient();
        VisitDetailDto detail = visitService.getVisitById(visitId);
        if (!detail.getPatientId().equals(patient.getId())) {
            throw new org.example.cavista.exception.PatientNotFoundException(
                    "Visit " + visitId + " does not belong to your account");
        }
        return detail;
    }

    public PatientProfileDto getMyQr() {
        return getMyProfile();
    }

    @Transactional
    public VisitRequestDto createVisitRequest(VisitRequestCreateDto req) {
        PatientEntity patient = patientService.resolveCurrentPatient();
        VisitRequestEntity vr = VisitRequestEntity.builder()
                .patient(patient)
                .reason(req.getReason())
                .requestedDate(req.getRequestedDate())
                .status(VisitRequestStatus.PENDING)
                .build();
        vr = visitRequestRepository.save(vr);
        return toDto(vr);
    }

    public List<VisitRequestDto> getMyVisitRequests() {
        PatientEntity patient = patientService.resolveCurrentPatient();
        return visitRequestRepository.findByPatientOrderByCreatedAtDesc(patient)
                .stream().map(this::toDto).toList();
    }

    private VisitRequestDto toDto(VisitRequestEntity vr) {
        return VisitRequestDto.builder()
                .id(vr.getId())
                .patientId(vr.getPatient().getId())
                .reason(vr.getReason())
                .requestedDate(vr.getRequestedDate())
                .status(vr.getStatus().name())
                .notes(vr.getNotes())
                .createdAt(vr.getCreatedAt())
                .build();
    }
}
