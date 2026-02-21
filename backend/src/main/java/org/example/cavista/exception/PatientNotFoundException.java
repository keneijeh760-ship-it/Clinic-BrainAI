package org.example.cavista.exception;

public class PatientNotFoundException extends RuntimeException {

    public PatientNotFoundException(Long patientId) {
        super("Patient not found: " + patientId);
    }

    public PatientNotFoundException(String qrToken) {
        super("Patient not found for QR token: " + qrToken);
    }
}
