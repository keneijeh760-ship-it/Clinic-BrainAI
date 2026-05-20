package org.example.cavista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.*;
import org.example.cavista.service.PatientPortalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * All routes under /api/v1/me — accessible only to PATIENT role users.
 */
@RestController
@RequestMapping("/api/v1/me")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor
public class PatientPortalController {

    private final PatientPortalService patientPortalService;

    @GetMapping("/profile")
    public ResponseEntity<PatientProfileDto> getMyProfile() {
        return ResponseEntity.ok(patientPortalService.getMyProfile());
    }

    @PatchMapping("/profile")
    public ResponseEntity<PatientProfileDto> updateMyProfile(
            @Valid @RequestBody UpdatePatientProfileRequest request) {
        return ResponseEntity.ok(patientPortalService.updateMyProfile(request));
    }

    @GetMapping("/visits")
    public ResponseEntity<Page<VisitSummaryDto>> getMyVisits(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(patientPortalService.getMyVisits(pageable));
    }

    @GetMapping("/visits/{id}")
    public ResponseEntity<VisitDetailDto> getMyVisit(@PathVariable Long id) {
        return ResponseEntity.ok(patientPortalService.getMyVisit(id));
    }

    @GetMapping("/qr")
    public ResponseEntity<PatientProfileDto> getMyQr() {
        return ResponseEntity.ok(patientPortalService.getMyQr());
    }

    @PostMapping("/visit-requests")
    public ResponseEntity<VisitRequestDto> createVisitRequest(
            @Valid @RequestBody VisitRequestCreateDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientPortalService.createVisitRequest(request));
    }

    @GetMapping("/visit-requests")
    public ResponseEntity<List<VisitRequestDto>> getMyVisitRequests() {
        return ResponseEntity.ok(patientPortalService.getMyVisitRequests());
    }
}
