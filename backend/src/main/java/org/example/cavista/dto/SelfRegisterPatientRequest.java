package org.example.cavista.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

/**
 * Patient self-registration: creates a portal (PATIENT) user account
 * and a linked PatientEntity in a single transaction.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelfRegisterPatientRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Length(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull
    @Valid
    private PatientDemographicsDto demographics;
}
