package com.chronicles.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignLoreCreateDTO {

    @NotBlank(message = "A categoria é obrigatória")
    @Size(max = 50, message = "A categoria não pode exceder 50 caracteres")
    private String category;

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 150, message = "O título não pode exceder 150 caracteres")
    private String title;

    private String description;
    private String imageUrl;

    @Builder.Default
    private Boolean isVisible = true;

    private Map<String, Object> data;
}
