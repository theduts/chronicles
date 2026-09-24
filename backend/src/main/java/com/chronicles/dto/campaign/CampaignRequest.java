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
    private String ilustracao;
}
