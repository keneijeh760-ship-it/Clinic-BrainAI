package org.example.cavista.Patient;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.cavista.User.User;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientEntity {
    @Id
    @SequenceGenerator(
            name = "patient_Id",
            sequenceName = "user_Id",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "patient_Id",
            strategy = GenerationType.SEQUENCE
    )
    private Long Id;
    private  String firstName;
    private String nextOfKinName;
    private String nextOfKinPhone;
    private String lastName;
    private String email;
    private LocalDateTime dob;

    @Column(unique = true)
    private String qrToken;

    private LocalDateTime QRCODEcreatedAt;

    @Enumerated(EnumType.STRING)
    private Sex sex;

    @ManyToOne(fetch = FetchType.LAZY,  cascade = CascadeType.ALL)
    private User chew;
}
