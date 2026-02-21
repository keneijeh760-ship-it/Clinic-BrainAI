package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeDto {
    private Long id;
    private String decision;  // ADMIT, REFER, DISCHARGE
    private String note;
    private LocalDateTime recordedAt;
}
