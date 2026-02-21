package org.example.cavista.repository;

import org.example.cavista.entity.OutcomeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OutcomeRepository extends JpaRepository<OutcomeEntity, Long> {

    Optional<OutcomeEntity> findByVisit_Id(Long visitId);
}
