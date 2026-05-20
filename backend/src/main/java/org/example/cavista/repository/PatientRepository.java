package org.example.cavista.repository;

import org.example.cavista.entity.PatientEntity;
import org.example.cavista.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<PatientEntity, Long> {

    Optional<PatientEntity> findByQrToken(String qrToken);

    Optional<PatientEntity> findByUser(UserEntity user);

    Page<PatientEntity> findByCreatedByOrderByCreatedAtDesc(UserEntity createdBy, Pageable pageable);

    @Query("""
        SELECT p FROM PatientEntity p
        WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.lastName)  LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(p.qrToken)   LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY p.lastName, p.firstName
        """)
    Page<PatientEntity> search(@Param("q") String q, Pageable pageable);
}
