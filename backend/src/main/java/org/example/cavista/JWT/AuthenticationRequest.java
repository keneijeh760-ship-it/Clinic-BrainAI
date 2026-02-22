package org.example.cavista.JWT;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@Builder
public class AuthenticationRequest {
    @Valid
    @Email
    private String email;
    @Size(min = 8, max = 16)
    @NotBlank
    @Valid
    private String password;
}
