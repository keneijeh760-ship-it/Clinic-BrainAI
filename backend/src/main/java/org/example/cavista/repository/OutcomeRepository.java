package org.example.cavista.repository;

import org.example.cavista.entity.OutcomeEntity;
import org.example.cavista.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OutcomeRepository extends JpaRepository<OutcomeEntity, Long> {

    Optional<OutcomeEntity> findByVisit_Id(Long visitId);

    boolean existsByVisit_Id(Long visitId);

    Page<OutcomeEntity> findByDoctorOrderByRecordedAtDesc(UserEntity doctor, Pageable pageable);
}
