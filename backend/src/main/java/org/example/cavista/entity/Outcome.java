package org.example.cavista.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.cavista.User.User;

@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Outcome {
    @Id
    @SequenceGenerator(
            name = "outcome_Id",
            sequenceName = "outcome_Id",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "outcome_Id",
            strategy = GenerationType.SEQUENCE
    )
    private Long Id;

    @Enumerated(EnumType.STRING)
    private Decisions decision;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_Id", nullable = false)
    private User doctor;


    @OneToOne
    @JoinColumn(name = "visit_Id", nullable = false)
    private Visit visit;
}
