package org.example.cavista.config;

import lombok.RequiredArgsConstructor;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.example.cavista.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds demo users (CHEW, DOCTOR, ADMIN) for development/testing.
 * Skipped in the `test` profile so integration tests start with a clean database.
 */
@Configuration
@RequiredArgsConstructor
@Profile("!test")
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail("demo.chew@example.com").isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .chewId("CHEW-001")
                        .name("Demo CHEW")
                        .email("demo.chew@example.com")
                        .phoneNumber("08000000000")
                        .role(UserRole.CHEW)
                        .password(passwordEncoder.encode("password"))
                        .build());
            }
            if (userRepository.findByEmail("demo.doctor@example.com").isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .chewId("DOC-001")
                        .name("Demo Doctor")
                        .email("demo.doctor@example.com")
                        .phoneNumber("08000000001")
                        .role(UserRole.DOCTOR)
                        .password(passwordEncoder.encode("password"))
                        .build());
            }
            if (userRepository.findByEmail("demo.admin@example.com").isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .chewId("ADMIN-001")
                        .name("Demo Admin")
                        .email("demo.admin@example.com")
                        .phoneNumber("08000000002")
                        .role(UserRole.ADMIN)
                        .password(passwordEncoder.encode("password"))
                        .build());
            }
        };
    }
}
