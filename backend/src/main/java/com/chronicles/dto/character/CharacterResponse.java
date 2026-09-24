package com.chronicles.dto.character;

import com.chronicles.domain.jsonb.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CharacterResponse {
    private UUID id;
    private String name;
    private String sex;
    private String race;
    private String weight;
    private String height;
    private String age;
    private String classKit;
    private Integer level;
    private Integer xp;
    private String portraitUrl;

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

    @JsonProperty("isPendingDMReview")
    private Boolean isPendingDMReview;

    private CharacterSheet pendingChanges;

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

    private UUID campaignId;
    private UUID userId;
}
