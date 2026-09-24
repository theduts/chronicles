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
public class StatPoint {
    private Object valorFinal;
    private Object danoSofrido;
    private Object magiaExaurida;
    private Object esforcoMental;
    private Object feExaurida;
    private String estadoMental;
}
