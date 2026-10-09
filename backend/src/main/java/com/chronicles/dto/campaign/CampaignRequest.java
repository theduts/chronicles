package com.chronicles.dto.campaign;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignRequest {
    @NotBlank(message = "O nome da campanha é obrigatório")
    private String name;

    private String subtitulo;
    private String universo;
    private String currentAct;
    private String lore;
    @com.fasterxml.jackson.annotation.JsonAlias({"illustrationUrl", "ilustration_url", "illustration_url"})
    private String ilustracao;
}
