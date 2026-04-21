package org.example.cavista.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.cavista.entity.UserRole;
import org.hibernate.validator.constraints.Length;

/**
 * Admin-only request body for creating DOCTOR / ADMIN / CHEW users.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    private String phoneNumber;

    @NotBlank
    @Length(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank
    @Pattern(regexp = "CHEW|DOCTOR|ADMIN", message = "Role must be one of CHEW, DOCTOR, ADMIN")
    private UserRole role;
}
