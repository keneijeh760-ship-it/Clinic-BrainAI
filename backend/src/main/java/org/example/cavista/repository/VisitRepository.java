package org.example.cavista.repository;

import org.example.cavista.entity.PatientEntity;
import org.example.cavista.entity.UserEntity;
import org.example.cavista.entity.VisitEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VisitRepository extends JpaRepository<VisitEntity, Long> {

    List<VisitEntity> findByPatientOrderByVisitTimeDesc(PatientEntity patient);

    Optional<VisitEntity> findTopByPatientOrderByVisitTimeDesc(PatientEntity patient);

    long countByChew_ChewId(String chewId);

    Page<VisitEntity> findByChewOrderByVisitTimeDesc(UserEntity chew, Pageable pageable);

    Page<VisitEntity> findByPatientOrderByVisitTimeDesc(PatientEntity patient, Pageable pageable);

    /** Visits that have no doctor outcome yet. */
    @Query("""
        SELECT v FROM VisitEntity v
        WHERE NOT EXISTS (
            SELECT 1 FROM OutcomeEntity o WHERE o.visit = v
        )
        ORDER BY v.visitTime DESC
        """)
    Page<VisitEntity> findPendingReview(Pageable pageable);
}
