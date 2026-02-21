package org.example.cavista.service;

import org.example.cavista.dto.LeaderboardEntryDto;
import org.example.cavista.entity.ChewPointsEntity;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.repository.ChewPointsRepository;
import org.example.cavista.repository.UserRepository;
import org.example.cavista.repository.VisitRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor

public class LeaderboardService {

    private final ChewPointsRepository chewPointsRepository;
    private final UserRepository userRepository;
    private final VisitRepository visitRepository;

    /**
     * List top CHEWs by points for gamification demo.
     * @param topN max entries (default 10 if <= 0)
     */
    public List<LeaderboardEntryDto> getLeaderboard(int topN) {
        int limit = topN > 0 ? topN : 10;
        List<ChewPointsEntity> pointsList = chewPointsRepository.findByOrderByTotalPointsDesc(PageRequest.of(0, limit));

        List<LeaderboardEntryDto> result = new ArrayList<>();
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
