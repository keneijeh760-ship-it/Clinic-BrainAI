package org.example.cavista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cavista.JWT.AuthService;
import org.example.cavista.JWT.AuthenticationRequest;
import org.example.cavista.JWT.AuthenticationResponse;
import org.example.cavista.JWT.RegisterRequest;
import org.example.cavista.dto.PatientAuthResponse;
import org.example.cavista.dto.SelfRegisterPatientRequest;
import org.example.cavista.dto.UserResponse;
import org.example.cavista.entity.UserEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthService authService;

    /** Public: register a new CHEW account. */
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /** Public: log in and receive a JWT. */
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    /**
     * Public: patient self-registration. Creates a PATIENT user account and a
     * linked PatientEntity, returns a JWT so the patient is immediately logged in.
     */
    @PostMapping("/register/patient")
    public ResponseEntity<PatientAuthResponse> registerPatient(
            @Valid @RequestBody SelfRegisterPatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerPatient(request));
    }

    /**
     * Authenticated: return the profile of the calling user.
     * The principal is the {@link UserEntity} placed in the security context by
     * {@link org.example.cavista.JWT.JWTAuthenticationFilter}.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserEntity user) {
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .staffId(user.getChewId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .build();
        return ResponseEntity.ok(response);
    }
}
