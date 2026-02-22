package org.example.cavista.repository;

import org.example.cavista.entity.PatientEntity;
import org.example.cavista.entity.VisitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VisitRepository extends JpaRepository<VisitEntity, Long> {

    List<VisitEntity> findByPatientOrderByVisitTimeDesc(PatientEntity patient);

    Optional<VisitEntity> findTopByPatientOrderByVisitTimeDesc(PatientEntity patient);

    long countByChew_Id(Long id);
}
