package org.example.cavista.JWT;

import lombok.RequiredArgsConstructor;

import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.example.cavista.exception.DuplicateEmailException;
import org.example.cavista.exception.UserNotFoundException;
import org.example.cavista.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Public registration: always creates a CHEW account. DOCTOR / ADMIN users
     * must be created by an existing ADMIN via {@code POST /api/v1/users}.
     */
    public AuthenticationResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateEmailException(registerRequest.getEmail());
        }

        UserRole role = UserRole.CHEW;
        UserEntity user = UserEntity.builder()
                .email(registerRequest.getEmail())
                .name(registerRequest.getName())
                .phoneNumber(registerRequest.getPhoneNumber())
                .role(role)
                .chewId(generateStaffId(role))
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        UserEntity savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticationRequest.getEmail(),
                        authenticationRequest.getPassword()
                )
        );

        UserEntity user = userRepository.findByEmail(authenticationRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException(authenticationRequest.getEmail()));

        String token = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    private String generateStaffId(UserRole role) {
        String prefix = switch (role) {
            case ADMIN -> "ADMIN";
            case CHEW -> "CHEW";
            case DOCTOR -> "DOC";
        };
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
