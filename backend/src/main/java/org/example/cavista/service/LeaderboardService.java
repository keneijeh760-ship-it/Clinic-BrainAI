package org.example.cavista.service;

import lombok.RequiredArgsConstructor;
import org.example.cavista.dto.LeaderboardEntryDto;
import org.example.cavista.entity.ChewPointsEntity;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.repository.ChewPointsRepository;
import org.example.cavista.repository.UserRepository;
import org.example.cavista.repository.VisitRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor

public class LeaderboardService {

    private final ChewPointsRepository chewPointsRepository;
    private final UserRepository userRepository;
    private final VisitRepository visitRepository;
    private final RedisTemplate<String, Object> redisTemplate;


    public List<LeaderboardEntryDto> getLeaderboard(int topN) {

        String cacheKey = "leaderboard:: " + topN;

        List<LeaderboardEntryDto> cached =
                (List<LeaderboardEntryDto>) redisTemplate.opsForValue().get(cacheKey);

                if (cached != null){
                    return cached;
                }

                int limit = topN > 0 ? topN: 10;
                List<ChewPointsEntity> pointsList =
                        chewPointsRepository.findByOrderByTotalPointsDesc(PageRequest.of(0, limit));
                List<LeaderboardEntryDto> result = new ArrayList<>();

                for (ChewPointsEntity points: pointsList){
                    String chewName = userRepository.findByChewId(points.getChewId())
                            .map(UserEntity::getName)
                            .orElse("Unkown");

                    int visitCount = (int) visitRepository.countByChew_ChewId(points.getChewId());

                    result.add(LeaderboardEntryDto.builder()
                            .chewId(points.getChewId())
                            .chewName(chewName)
                            .totalPoints(points.getTotalPoints())
                            .totalPoints(points.getTotalPoints())
                            .visitCount(visitCount)
                            .build());
                }

                redisTemplate.opsForValue().set(cacheKey, result, Duration.ofMinutes(5));

                return result;
    }


}
