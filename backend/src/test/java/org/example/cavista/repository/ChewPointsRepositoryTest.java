package org.example.cavista.repository;

import org.example.cavista.entity.ChewPointsEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ChewPointsRepositoryTest {

    @Autowired
    ChewPointsRepository chewPointsRepository;

    @Test
    void findByOrderByTotalPointsDescReturnsSorted() {
        chewPointsRepository.save(ChewPointsEntity.builder()
                .chewId("CHEW-A")
                .totalPoints(50)
                .totalPatientsCaptured(2)
                .build());
        chewPointsRepository.save(ChewPointsEntity.builder()
                .chewId("CHEW-B")
                .totalPoints(200)
                .totalPatientsCaptured(5)
                .build());

        List<ChewPointsEntity> top = chewPointsRepository.findByOrderByTotalPointsDesc(PageRequest.of(0, 1));
        assertThat(top).hasSize(1);
        assertThat(top.get(0).getChewId()).isEqualTo("CHEW-B");
    }
}
