package org.example.cavista.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalsEntity {

    @Id
    @SequenceGenerator(
            name = "vitals_Id",
            sequenceName = "vitals_Id",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "vitals_Id",
            strategy = GenerationType.SEQUENCE)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false, unique = true)
    private VisitEntity visit;

    private Double bloodPressureSystolic;
    private Double bloodPressureDiastolic;
    private Double temperature;
    private Integer pulse;
    private Integer respiratoryRate;
    private Double oxygenSaturation;
}
