package org.example.cavista.JWT;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Data
@Builder
public class AuthenticationResponse {
    private String token;
}
