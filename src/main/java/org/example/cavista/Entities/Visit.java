package org.example.cavista;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class Entities {
    @Id
    @SequenceGenerator(
            name = "üser_Id",
            sequenceName = "visit_Id",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "visit_Id",
            strategy = GenerationType.SEQUENCE
    )
    private Long Id;
    
}
