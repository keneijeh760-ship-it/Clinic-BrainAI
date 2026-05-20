package org.example.cavista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.*;
import org.example.cavista.service.PatientService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    /** CHEW: register a patient during a field visit. */
    @PostMapping("/register")
    @PreAuthorize("hasRole('CHEW')")
    public ResponseEntity<PatientProfileDto> registerPatient(@Valid @RequestBody RegisterPatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.registerPatient(request));
    }

    /** DOCTOR / ADMIN: scan QR and get full patient view. */
    @GetMapping("/qr/{qrToken}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<DoctorPatientViewDto> getPatientByQrToken(@PathVariable String qrToken) {
        return ResponseEntity.ok(patientService.getPatientByQrToken(qrToken));
    }

    /** CHEW: paginated list of patients they registered. */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('CHEW')")
    public ResponseEntity<Page<PatientProfileDto>> getMyPatients(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(patientService.getMyPatients(pageable));
    }

    /** DOCTOR / ADMIN: search patients by name or QR token. */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Page<PatientProfileDto>> searchPatients(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(patientService.searchPatients(q, pageable));
    }
}
