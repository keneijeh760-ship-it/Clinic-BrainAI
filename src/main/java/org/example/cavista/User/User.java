package org.example.cavista.User;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @SequenceGenerator(
            name = "üser_Id",
            sequenceName = "user_Id",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "user_Id",
            strategy = GenerationType.SEQUENCE
    )
    private Long Id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private LocalDate dob;
    private String phoneNumber;
    @Enumerated(EnumType.STRING)
    private Role role;
}
