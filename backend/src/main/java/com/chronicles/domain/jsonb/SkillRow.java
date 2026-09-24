package com.chronicles.domain.jsonb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillRow {
    private String group;
    private Object atributo;
    private Object gasto;
    private String total;
    private String baseAttr;
    private String parentSkillName;
    private String chosenSubgroup;
    private List<SkillSubgroup> subgrupos;

    @JsonProperty("requer_ataque_defesa")
    private Boolean requerAtaqueDefesa;

    private Integer atkGasto;
    private Integer defGasto;
    private Boolean isCustomBuild;
    private Integer sliderVal;
    private Object pointsToInsert;
    private Integer pontosGratis;
}
