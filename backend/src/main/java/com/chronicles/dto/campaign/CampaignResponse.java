package com.chronicles.dto.campaign;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CampaignResponse {
    private UUID id;
    private String name;
    private String dmEmail;
    private UUID dmId;
    private List<String> players;
    private String subtitulo;
    private String universo;
    private String currentAct;
    private String lore;
    private String ilustracao;
    private String inviteCode;
    private Boolean isDm;
}
