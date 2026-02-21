package org.example.cavista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitVisitRequest {

    @NotBlank(message = "chewId is required")
    private String chewId;

    private Long patientId;

    @Valid
    private PatientDemographicsDto patientDemographics;

    @NotBlank(message = "chiefComplaint is required")
    private String chiefComplaint;

    private SymptomFlagsDto symptomFlags;

    private VitalsDto vitals;

    @NotBlank(message = "locationName is required")
    private String locationName;
}
