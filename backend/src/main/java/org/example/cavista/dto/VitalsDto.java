package org.example.cavista.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalsDto {
    private Double bloodPressureSystolic;
    private Double bloodPressureDiastolic;
    private Double temperature;
    private Integer pulse;
    private Integer respiratoryRate;
    private Double oxygenSaturation;
}
