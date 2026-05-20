package org.example.cavista.repository;

import org.example.cavista.entity.PatientEntity;
import org.example.cavista.entity.VisitRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitRequestRepository extends JpaRepository<VisitRequestEntity, Long> {

    List<VisitRequestEntity> findByPatientOrderByCreatedAtDesc(PatientEntity patient);
}
