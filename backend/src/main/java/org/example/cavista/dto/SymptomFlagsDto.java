package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomFlagsDto {
    private Boolean fever;
    private Boolean cough;
    private Boolean difficultyBreathing;
    private Boolean chestPain;
    private Boolean severeHeadache;
    private Boolean confusion;
    private Boolean bleeding;
    private Boolean lossOfConsciousness;
    private Boolean severeDehydration;
    private Boolean convulsions;
}
