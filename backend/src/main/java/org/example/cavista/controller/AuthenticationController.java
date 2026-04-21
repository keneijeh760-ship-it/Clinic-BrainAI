package org.example.cavista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cavista.JWT.AuthService;
import org.example.cavista.JWT.AuthenticationRequest;
import org.example.cavista.JWT.AuthenticationResponse;
import org.example.cavista.JWT.RegisterRequest;
import org.example.cavista.dto.CreateUserRequest;
import org.example.cavista.dto.UserResponse;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @GetMapping("/me")
    ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal AuthenticationRequest authenticationRequest) {
        UserEntity entity = userRepository.findByEmail(authenticationRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + authenticationRequest.getEmail()));

        UserResponse response = UserResponse.builder()
                .role(entity.getRole())
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phoneNumber(entity.getPhoneNumber())
                .staffId(entity.getChewId())
                .build();

        return ResponseEntity.ok(response);
    }
}
