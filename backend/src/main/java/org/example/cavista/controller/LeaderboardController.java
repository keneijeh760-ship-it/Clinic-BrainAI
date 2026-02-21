package org.example.cavista.controller;

import org.example.cavista.dto.LeaderboardEntryDto;
import org.example.cavista.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @RequestParam(defaultValue = "10") int top) {
        List<LeaderboardEntryDto> entries = leaderboardService.getLeaderboard(top);
        return ResponseEntity.ok(entries);
    }
}
