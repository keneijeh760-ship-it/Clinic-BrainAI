package org.example.cavista.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.cavista.entity.PaymentOptions;
import org.example.cavista.entity.UserEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients", schema = "app")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_identifier", unique = true, nullable = false)
    private String qrToken;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;
    private String phoneNumber;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_options")
    private PaymentOptions paymentOptions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private UserEntity createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}