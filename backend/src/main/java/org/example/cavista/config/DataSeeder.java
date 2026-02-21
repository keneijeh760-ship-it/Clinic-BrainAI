package org.example.cavista.config;

import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.example.cavista.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Seeds a demo CHEW user for development/testing.
 */
@Configuration
@Profile("!test")
public class DataSeeder {

    @Bean
    CommandLineRunner seedChew(UserRepository userRepository) {
        return args -> {
            if (userRepository.findById(1L).isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .chewId("CHEW-001")
                        .name("Demo CHEW")
                        .role(UserRole.CHEW)
                        .build());
            }
            if (userRepository.findById(1L).isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .chewId("DOC-001")
                        .name("Demo Doctor")
                        .role(UserRole.DOCTOR)
                        .build());
            }
        };
    }
}
