package org.example.cavista.config;

import lombok.RequiredArgsConstructor;


import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class RestConfig {

    private final GroqProperties groqProperties;

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(groqProperties.getTimeoutMs()))
                .setReadTimeout(Duration.ofMillis(groqProperties.getTimeoutMs()))
                .build();
    }
}