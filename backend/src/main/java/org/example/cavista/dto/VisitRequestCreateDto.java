package org.example.cavista.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequestCreateDto {

    @NotBlank(message = "reason is required")
    private String reason;

    private LocalDate requestedDate;
}
