package org.example.cavista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Visit-submission request. The acting CHEW is resolved from the JWT principal,
 * NOT from the request body.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitVisitRequest {

    /** Optional — if omitted, {@link #patientDemographics} must be supplied. */
    private Long patientId;

    @Valid
    private PatientDemographicsDto patientDemographics;

    @NotBlank(message = "chiefComplaint is required")
    private String chiefComplaint;

    private SymptomFlagsDto symptomFlags;

    @Valid
    private VitalsDto vitals;

    @NotBlank(message = "locationName is required")
    private String locationName;
}
