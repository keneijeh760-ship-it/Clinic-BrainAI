package org.example.cavista.repository;

import org.example.cavista.entity.VitalsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VitalsRepository extends JpaRepository<VitalsEntity, Long> {

    Optional<VitalsEntity> findByVisit_Id(Long visitId);
}
