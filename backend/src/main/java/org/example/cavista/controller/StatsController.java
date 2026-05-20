package org.example.cavista.controller;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.StatsOverviewDto;
import org.example.cavista.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /** ADMIN / DOCTOR: platform-wide overview numbers. */
    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<StatsOverviewDto> getOverview() {
        return ResponseEntity.ok(statsService.getOverview());
    }
}
