package org.example.cavista.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Enables Spring Cache. When Redis is available, {@link RedisConfig} registers a
 * {@link org.springframework.data.redis.cache.RedisCacheManager}. Otherwise
 * {@code spring.cache.type=simple} (e.g. in tests) provides an in-memory cache.
 */
@Configuration
@EnableCaching
public class CacheConfig {
}
