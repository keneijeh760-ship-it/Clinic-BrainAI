package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.config.GroqProperties;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GroqAiClient {

    private final RestTemplate restTemplate;
    private final GroqProperties properties;

    public String callModel(String prompt) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(properties.getApiKey());

        Map<String, Object> body = Map.of(
                "model", properties.getModel(),
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                """
                                You are an experienced clinical triage assistant
                                supporting frontline healthcare workers.

                                Rules:
                                - Do NOT prescribe medications
                                - Do NOT give dosages
                                - Do NOT make definitive diagnoses
                                - Focus on risk and clinical observations
                                """
                        ),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.2,
                "max_tokens", 250
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response =
                    restTemplate.exchange(
                            properties.getBaseUrl(),
                            HttpMethod.POST,
                            request,
                            (Class<Map<String, Object>>) (Class<?>) Map.class
                    );

            return extractContent(response.getBody());

        } catch (Exception e) {
            return null; // fallback handled upstream
        }
    }

    private String extractContent(Map<String, Object> response) {
        try {
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> first = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) first.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return null;
        }
    }
}