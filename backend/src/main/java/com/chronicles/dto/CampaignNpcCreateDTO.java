package com.chronicles.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignNpcCreateDTO {

    @NotBlank(message = "O nome do NPC é obrigatório")
    @Size(max = 150, message = "O nome não pode exceder 150 caracteres")
    private String name;

    @Size(max = 80, message = "A raça não pode exceder 80 caracteres")
    private String race;

    @Size(max = 120, message = "A ocupação não pode exceder 120 caracteres")
    private String occupation;

    private String description;

    private String notes;

    private String portraitUrl;

    @Builder.Default
    private Boolean isPersona = false;

    private java.util.Map<String, Object> data;

    @Builder.Default
    private Boolean isTemplate = false;
}
