package com.chronicles.domain.jsonb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CharacterSheet {
    private String sex;
    private String weight;
    private String height;
    private String age;

    private CharacterAttributes attributes;
    private StatusPoints statusPoints;
    private Protection protection;

    private List<String> aprimoramentosPositivos;
    private List<String> aprimoramentosNegativos;
    private String descricaoEfeitos;

    private CampaignGenres campaignGenres;
    private List<SkillRow> skills;
    private Treasure treasure;
    private List<Object> items;
    private String background;

    private Boolean isMagic;

    @JsonProperty("has_pending_magic_enchant")
    private Boolean hasPendingMagicEnchant;

    private List<Map<String, Object>> spells;
    private String alinhamento;
    private Map<String, Object> focusAllocation;
    private List<Map<String, Object>> armors;
    private Map<String, Object> armaPreferencialVinculo;
    private Map<String, Object> companionAnimal;
    private Map<String, Object> montariaEspecial;
    private Map<String, Object> familiar;
}
