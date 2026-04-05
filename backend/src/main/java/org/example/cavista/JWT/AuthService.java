package org.example.cavista.JWT;

import lombok.RequiredArgsConstructor;

import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.example.cavista.exception.UserNotFoundException;
import org.example.cavista.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register (RegisterRequest registerRequest) {

        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw  new RuntimeException("Email already exist");
        }
        UserEntity user = UserEntity.builder()
                .email(registerRequest.getEmail())
                .name(registerRequest. getName())
                .phoneNumber(registerRequest.getPhoneNmaber())
                .role(registerRequest.getRole())
                .chewId(generateStaffId(registerRequest.getRole()))
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        UserEntity savedUser = userRepository.save(user);
        var token = jwtService.generateToken(savedUser);

        return AuthenticationResponse.builder()
                .token(token)
                .build();

    }

    public AuthenticationResponse authenticate (AuthenticationRequest authenticationRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticationRequest.getEmail(),
                        authenticationRequest.getPassword()
                )

        );
        var user = userRepository.findByEmail(authenticationRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + authenticationRequest.getEmail()));

        var token = jwtService.generateToken(user);
        return  AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    private String generateStaffId(UserRole role){
        return switch (role){
            case ADMIN -> "ADMIN-" + System.currentTimeMillis();
            case CHEW -> "CHEW-" + System.currentTimeMillis();
            case DOCTOR -> "DOCTOR-" + System.currentTimeMillis();
        };
    }
}
