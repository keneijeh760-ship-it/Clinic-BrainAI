package org.example.cavista.repository;

import org.example.cavista.entity.ChewPointsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ChewPointsRepository extends JpaRepository<ChewPointsEntity, Long> {

    Optional<ChewPointsEntity> findByChewId(String chewId);

    List<ChewPointsEntity> findByOrderByTotalPointsDesc(Pageable pageable);
}
