package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.CreateUserRequest;
import org.example.cavista.dto.UserResponse;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.example.cavista.exception.DuplicateEmailException;
import org.example.cavista.exception.UserNotFoundException;
import org.example.cavista.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        UserRole role = UserRole.valueOf(request.getRole().toUpperCase());
        String staffId = generateStaffId(role);

        UserEntity user = UserEntity.builder()
                .chewId(staffId)
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .role(role)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        return toResponse(user);
    }

    public UserResponse getUserById(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return toResponse(user);
    }

    private String generateStaffId(UserRole role) {
        String prefix = switch (role) {
            case CHEW -> "CHEW";
            case DOCTOR -> "DOC";
            case ADMIN -> "ADMIN";
        };
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private UserResponse toResponse(UserEntity user) {
        return UserResponse.builder()
                .id(user.getId())
                .staffId(user.getChewId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .build();
    }
}
