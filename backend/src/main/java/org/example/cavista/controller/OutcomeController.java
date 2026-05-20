package org.example.cavista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.OutcomeDto;
import org.example.cavista.dto.RecordOutcomeRequest;
import org.example.cavista.service.OutcomeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/outcomes")
@RequiredArgsConstructor
public class OutcomeController {

    private final OutcomeService outcomeService;

    /** DOCTOR: record a clinical outcome for a visit. */
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<OutcomeDto> recordOutcome(@Valid @RequestBody RecordOutcomeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(outcomeService.recordOutcome(request));
    }

    /** DOCTOR: paginated list of outcomes they have recorded. */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Page<OutcomeDto>> getMyOutcomes(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(outcomeService.getMyOutcomes(pageable));
    }
}
