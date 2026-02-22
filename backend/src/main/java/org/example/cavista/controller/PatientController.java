package org.example.cavista.controller;

import jakarta.validation.Valid;
import org.example.cavista.dto.*;
import org.example.cavista.service.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public ResponseEntity<PatientProfileDto> registerPatient(@Valid @RequestBody RegisterPatientRequest request) {
        PatientProfileDto response = patientService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Doctor QR scan - get patient profile with latest visit, vitals, outcome.
     */
    @GetMapping("/qr/{qrToken}")
    public ResponseEntity<DoctorPatientViewDto> getPatientByQrToken(@PathVariable String qrToken) {
        DoctorPatientViewDto view = patientService.getPatientByQrToken(qrToken);
        return ResponseEntity.ok(view);
    }
}
