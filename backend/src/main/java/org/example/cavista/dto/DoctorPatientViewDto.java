package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Doctor-friendly view when scanning patient QR.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPatientViewDto {
    private Long patientId;
    private String qrToken;
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;

    // Latest visit
    private Long latestVisitId;
    private LocalDateTime visitTime;
    private String chiefComplaint;
    private String riskLevel;
    private String aiSummary;
    private String locationName;

    // Vitals from latest visit
    private VitalsDto vitals;

    // Outcome if exists
    private OutcomeDto outcome;
}
