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
    @SequenceGenerator(name = "visit_Id",
    sequenceName = "visit_Id",
    allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE,
    generator = "visit_Id")
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

    // Symptom flags captured during visit
    @Column(name = "symptom_fever") private Boolean symptomFever;
    @Column(name = "symptom_cough") private Boolean symptomCough;
    @Column(name = "symptom_difficulty_breathing") private Boolean symptomDifficultyBreathing;
    @Column(name = "symptom_chest_pain") private Boolean symptomChestPain;
    @Column(name = "symptom_severe_headache") private Boolean symptomSevereHeadache;
    @Column(name = "symptom_confusion") private Boolean symptomConfusion;
    @Column(name = "symptom_bleeding") private Boolean symptomBleeding;
    @Column(name = "symptom_loss_of_consciousness") private Boolean symptomLossOfConsciousness;
    @Column(name = "symptom_severe_dehydration") private Boolean symptomSevereDehydration;
    @Column(name = "symptom_convulsions") private Boolean symptomConvulsions;
}
