package org.example.cavista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordOutcomeRequest {

    @NotNull
    private Long visitId;

    @NotBlank
    private Long doctorId;  // Staff ID of the doctor

    @NotBlank
    private String decision;  // ADMIT, REFER, DISCHARGE

    private String note;
}
