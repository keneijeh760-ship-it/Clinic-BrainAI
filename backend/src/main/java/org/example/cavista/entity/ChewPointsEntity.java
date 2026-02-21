package org.example.cavista.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chew_points", uniqueConstraints = {
        @UniqueConstraint(columnNames = "chew_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChewPointsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chew_id", unique = true, nullable = false)
    private String chewId;

    private int totalPoints;
    private int totalPatientsCaptured;
}
