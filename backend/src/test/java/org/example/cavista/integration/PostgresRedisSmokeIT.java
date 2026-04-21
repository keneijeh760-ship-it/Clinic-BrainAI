package org.example.cavista.integration;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * Full context against real Postgres + Redis. Excluded from default {@code mvn test}
 * (see {@code maven-surefire-plugin} {@code excludedGroups}). With Docker:
 * {@code mvn test -Dgroups=it -DexcludedGroups=none}
 */
@Tag("it")
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@ActiveProfiles({"it"})
class PostgresRedisSmokeIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("spring.data.redis.host", redis::getHost);
        r.add("spring.data.redis.port", () -> String.valueOf(redis.getMappedPort(6379)));
        r.add("app.security.jwt.secret", () -> "dGVzdC1zZWNyZXQtZm9yLWp3dC1sb2NhbC10ZXN0aW5nLW9ubHktMTIzNDU2Nzg5MA==");
    }

    @Test
    void contextLoads() {
    }
}
