package org.example.cavista.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Staff identifier: CHEW-xxx, DOC-xxx, ADMIN-xxx */
    @Column(unique = true, nullable = false)
    private String chewId;

    @Column(nullable = false)
    private String name;

    private String email;
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
}
