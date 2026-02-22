package org.example.cavista.JWT;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@RequiredArgsConstructor
public class RegisterRequest {
    @Valid
    @Email
    @NotBlank
    private String email;
    @Valid
    @NotBlank
    @Size(min = 8, max = 16)
    private String password;
    private String name;

}
