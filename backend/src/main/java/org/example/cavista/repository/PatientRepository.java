package org.example.cavista.repository;

import org.example.cavista.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<PatientEntity, Long> {

    java.util.Optional<PatientEntity> findByQrToken(String qrToken);
}
