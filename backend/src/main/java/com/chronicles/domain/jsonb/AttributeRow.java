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
public class AttributeRow {
    private Object natural;
    private Object penalidade;
    private Object bonusRacial;
    private String pctNatural;
    private Integer valorAmpliado;
    private String pctAmpliado;
    private Object pontosGastos;
    private Object penalidadeManual;
    private Object penalidadeExtra;
    private Object bonusRacialManual;
    private Object bonusRacialExtra;
}
