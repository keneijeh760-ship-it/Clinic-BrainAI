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
 * Seeds a demo CHEW user for development/testing.
 */
@Configuration
@RequiredArgsConstructor
@Profile("!test")
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedChew(UserRepository userRepository) {
        return args -> {
            if (userRepository.findById(1L).isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .chewId("CHEW-001")
                        .name("Demo CHEW")
                        .email("demo.chew@example.com")
                        .phoneNumber("08000000000")
                        .role(UserRole.CHEW)
                        .password(passwordEncoder.encode("password"))
                        .build());
            }
            if (userRepository.findById(1L).isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .chewId("CHEW-001")
                        .name("Demo CHEW")
                        .email("demo.chew@example.com")
                        .phoneNumber("08000000000")
                        .role(UserRole.CHEW)
                        .password(passwordEncoder.encode("password"))
                        .build());
            }
        };
    }
}
