package org.example.cavista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.*;
import org.example.cavista.service.SubmitVisitService;
import org.example.cavista.service.VisitService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/visits")
@RequiredArgsConstructor
public class VisitController {

    private final SubmitVisitService submitVisitService;
    private final VisitService visitService;

    /** CHEW: submit a new visit record. */
    @PostMapping("/submit")
    @PreAuthorize("hasRole('CHEW')")
    public ResponseEntity<SubmitVisitResponse> submitVisit(@Valid @RequestBody SubmitVisitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(submitVisitService.submitVisit(request));
    }

    /** CHEW: visits the calling CHEW has submitted. */
    @GetMapping("/mine")
    @PreAuthorize("hasRole('CHEW')")
    public ResponseEntity<Page<VisitSummaryDto>> getMyVisits(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(visitService.getMyVisits(pageable));
    }

    /** CHEW / DOCTOR: visits awaiting a doctor outcome. */
    @GetMapping("/pending-review")
    @PreAuthorize("hasAnyRole('CHEW', 'DOCTOR')")
    public ResponseEntity<Page<VisitSummaryDto>> getPendingReview(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(visitService.getPendingReview(pageable));
    }

    /** Any authenticated staff: get full detail for a specific visit (incl. AI summary). */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEW', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<VisitDetailDto> getVisitById(@PathVariable Long id) {
        return ResponseEntity.ok(visitService.getVisitById(id));
    }
}
