package org.example.cavista.JWT;

import lombok.RequiredArgsConstructor;

import org.example.cavista.dto.PatientAuthResponse;
import org.example.cavista.dto.PatientDemographicsDto;
import org.example.cavista.dto.PatientProfileDto;
import org.example.cavista.dto.SelfRegisterPatientRequest;
import org.example.cavista.entity.PatientEntity;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.example.cavista.exception.DuplicateEmailException;
import org.example.cavista.exception.UserNotFoundException;
import org.example.cavista.repository.PatientRepository;
import org.example.cavista.repository.UserRepository;
import org.example.cavista.service.QrCodeService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final QrCodeService qrCodeService;
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

    /**
     * Patient self-registration: creates a PATIENT user account and a linked
     * PatientEntity in a single transaction, then issues a JWT.
     */
    @Transactional
    public PatientAuthResponse registerPatient(SelfRegisterPatientRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new DuplicateEmailException(req.getEmail());
        }

        UserEntity user = UserEntity.builder()
                .email(req.getEmail())
                .name(req.getDemographics().getFirstName() + " " + req.getDemographics().getLastName())
                .role(UserRole.PATIENT)
                .chewId(generateStaffId(UserRole.PATIENT))
                .password(passwordEncoder.encode(req.getPassword()))
                .build();
        user = userRepository.save(user);

        PatientDemographicsDto d = req.getDemographics();
        String qrToken = "QR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        PatientEntity patient = PatientEntity.builder()
                .qrToken(qrToken)
                .firstName(d.getFirstName())
                .lastName(d.getLastName())
                .dateOfBirth(d.getDateOfBirth())
                .gender(d.getGender())
                .phoneNumber(d.getPhoneNumber())
                .address(d.getAddress())
                .user(user)
                .build();
        patient = patientRepository.save(patient);

        String qrImage = qrCodeService.generateBase64Qr(patient.getQrToken());
        String token = jwtService.generateToken(user);

        PatientProfileDto profile = PatientProfileDto.builder()
                .patientId(patient.getId())
                .qrToken(patient.getQrToken())
                .qrCodeBase64(qrImage)
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .phoneNumber(patient.getPhoneNumber())
                .address(patient.getAddress())
                .build();

        return PatientAuthResponse.builder().token(token).profile(profile).build();
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
            case PATIENT -> "PAT";
        };
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
