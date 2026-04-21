package org.example.cavista.controller;

import org.example.cavista.dto.LeaderboardEntryDto;
import org.example.cavista.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    /**
     * Top-N leaderboard. Prefer {@code size} over {@code top} going forward.
     */
    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @RequestParam(required = false) Integer top,
            @RequestParam(defaultValue = "10") int size
    ) {
        int effective = top != null ? top : size;
        return ResponseEntity.ok(leaderboardService.getLeaderboard(effective));
    }
}
