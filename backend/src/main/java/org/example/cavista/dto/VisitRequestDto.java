package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequestDto {
    private Long id;
    private Long patientId;
    private String reason;
    private LocalDate requestedDate;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
}
