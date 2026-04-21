package org.example.cavista;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Minimal smoke test: the Spring context loads under the {@code test} profile
 * (H2, no Redis/Flyway — see {@code application-test.properties}).
 */
@SpringBootTest
@ActiveProfiles("test")
class CavistaApplicationTests {

    @Test
    void contextLoads() {
    }
}
