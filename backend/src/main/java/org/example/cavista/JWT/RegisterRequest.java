package org.example.cavista.JWT;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.cavista.entity.UserRole;
import org.hibernate.validator.constraints.Length;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @Email
    @NotBlank
    private String email;
    @NotBlank
    @Length(min = 8)
    private String password;
    @NotBlank
    private String name;
    @NotBlank
    private String phoneNumber;
    @NotNull
    private UserRole role = UserRole.CHEW;
}