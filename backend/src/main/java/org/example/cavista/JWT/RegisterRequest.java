package org.example.cavista.JWT;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

/**
 * Public registration request. Role is intentionally NOT accepted here —
 * new accounts are always created as CHEW. DOCTOR / ADMIN must be provisioned
 * by an existing ADMIN via {@code POST /api/v1/users}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Length(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank
    private String name;

    @NotBlank
    @Pattern(regexp = "^[+0-9][0-9 \\-]{6,19}$", message = "Invalid phone number")
    private String phoneNumber;
}
