package org.example.cavista.controller;

import jakarta.validation.Valid;
import org.example.cavista.dto.OutcomeDto;
import org.example.cavista.dto.RecordOutcomeRequest;
import org.example.cavista.service.OutcomeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/outcomes")
public class OutcomeController {

    private final OutcomeService outcomeService;

    public OutcomeController(OutcomeService outcomeService) {
        this.outcomeService = outcomeService;
    }

    @PostMapping
    public ResponseEntity<OutcomeDto> recordOutcome(@Valid @RequestBody RecordOutcomeRequest request) {
        OutcomeDto response = outcomeService.recordOutcome(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
