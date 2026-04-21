package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.LeaderboardEntryDto;
import org.example.cavista.entity.ChewPointsEntity;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.repository.ChewPointsRepository;
import org.example.cavista.repository.UserRepository;
import org.example.cavista.repository.VisitRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 100;

    private final ChewPointsRepository chewPointsRepository;
    private final UserRepository userRepository;
    private final VisitRepository visitRepository;

    @Cacheable(value = "leaderboard", key = "'top:' + #topN")
    public List<LeaderboardEntryDto> getLeaderboard(int topN) {
        int limit = topN > 0 ? Math.min(topN, MAX_LIMIT) : DEFAULT_LIMIT;

        List<ChewPointsEntity> pointsList =
                chewPointsRepository.findByOrderByTotalPointsDesc(PageRequest.of(0, limit));

        List<LeaderboardEntryDto> result = new ArrayList<>(pointsList.size());
        for (ChewPointsEntity points : pointsList) {
            String chewName = userRepository.findByChewId(points.getChewId())
                    .map(UserEntity::getName)
                    .orElse("Unknown");

            int visitCount = (int) visitRepository.countByChew_ChewId(points.getChewId());

            result.add(LeaderboardEntryDto.builder()
                    .chewId(points.getChewId())
                    .chewName(chewName)
                    .totalPoints(points.getTotalPoints())
                    .totalPatientsCaptured(points.getTotalPatientsCaptured())
                    .visitCount(visitCount)
                    .build());
        }
        return result;
    }
}
