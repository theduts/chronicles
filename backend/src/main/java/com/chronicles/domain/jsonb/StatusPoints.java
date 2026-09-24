package com.chronicles.domain.jsonb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StatusPoints {
    private StatPoint vida;
    private StatPoint heroicos;
    private StatPoint magia;
    private StatPoint fe;
    private StatPoint psi;
    private StatPoint willPoints;
}
