package org.example.cavista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Doctor outcome request. The acting doctor is resolved from the JWT principal,
 * NOT from the request body.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordOutcomeRequest {

    @NotNull
    private Long visitId;

    @NotBlank
    private String decision;  // ADMIT, REFER, DISCHARGE

    private String note;
}
