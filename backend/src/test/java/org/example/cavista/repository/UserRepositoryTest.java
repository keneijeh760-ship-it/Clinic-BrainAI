package org.example.cavista.repository;

import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class UserRepositoryTest {

    @org.springframework.beans.factory.annotation.Autowired
    private UserRepository userRepository;

    @Test
    void savesAndLooksUpByEmail() {
        UserEntity user = UserEntity.builder()
                .chewId("CHEW-TEST")
                .name("Test CHEW")
                .email("chew.test@example.com")
                .phoneNumber("08000000000")
                .role(UserRole.CHEW)
                .password("hashed")
                .build();
        userRepository.save(user);

        Optional<UserEntity> found = userRepository.findByEmail("chew.test@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getChewId()).isEqualTo("CHEW-TEST");
    }

    @Test
    void existsByEmailReturnsTrueAfterSave() {
        UserEntity user = UserEntity.builder()
                .chewId("DOC-TEST")
                .name("Test Doc")
                .email("doc.test@example.com")
                .role(UserRole.DOCTOR)
                .password("hashed")
                .build();
        userRepository.save(user);

        assertThat(userRepository.existsByEmail("doc.test@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("noone@example.com")).isFalse();
    }

    @Test
    void findByChewIdWorks() {
        UserEntity user = UserEntity.builder()
                .chewId("ADMIN-TEST")
                .name("Test Admin")
                .email("admin.test@example.com")
                .role(UserRole.ADMIN)
                .password("hashed")
                .build();
        userRepository.save(user);

        Optional<UserEntity> found = userRepository.findByChewId("ADMIN-TEST");
        assertThat(found).isPresent();
        assertThat(found.get().getRole()).isEqualTo(UserRole.ADMIN);
    }
}
