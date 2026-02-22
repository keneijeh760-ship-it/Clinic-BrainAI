package org.example.cavista.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.SubmitVisitRequest;
import org.example.cavista.dto.SubmitVisitResponse;
import org.example.cavista.service.SubmitVisitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final SubmitVisitService submitVisitService;


    @PostMapping("/submit")
    public ResponseEntity<SubmitVisitResponse> submitVisit(@Valid @RequestBody SubmitVisitRequest request) {
        SubmitVisitResponse response = submitVisitService.submitVisit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
