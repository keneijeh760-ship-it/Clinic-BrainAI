package org.example.cavista.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chew_user_id", nullable = false)
    private UserEntity chew;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientEntity patient;

    @Column(nullable = false)
    private LocalDateTime visitTime;

    @Column(nullable = false, length = 1000)
    private String chiefComplaint;

    @Column(nullable = false)
    private String locationName;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @Column(length = 2000)
    private String aiSummary;
}
