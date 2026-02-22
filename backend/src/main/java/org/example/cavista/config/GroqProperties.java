package org.example.cavista.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "groq")
public class GroqProperties {

    private String apiKey;
    private String baseUrl;
    private String model;
    private int timeoutMs;
}