package org.example.cavista.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * AI client provider layer. Plug your real LLM API here later.
 * Mock first for hackathon demo reliability.
 */
@Component
public class AiClientService {

    private final RestTemplate restTemplate;

    public AiClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String callModel(String prompt) {
        try {
            // TEMPORARY MOCK (replace with real provider)
            // This keeps your system working immediately
            return "• Patient presents with reported symptoms\n"
                    + "• Vital signs show possible abnormality\n"
                    + "• Recommend prompt clinical evaluation";
        } catch (Exception e) {
            throw new RuntimeException("AI service unavailable");
        }
    }
}
