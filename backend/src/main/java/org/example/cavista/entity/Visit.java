package org.example.cavista.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.example.cavista.entity.RiskLevel;
import org.example.cavista.entity.UserEntity;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class Visit {
    @Id
    @SequenceGenerator(
            name = "visit_Id",
            sequenceName = "visit_Id",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "visit_Id",
            strategy = GenerationType.SEQUENCE
    )
    private Long Id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chew_Id")
    private UserEntity chew;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientEntity patient;

    private LocalDateTime visitTime;

    private String cheifComplaint;
    private String aiSummary;
    private String location;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

}
