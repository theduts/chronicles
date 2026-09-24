package com.chronicles.dto.bestiary;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BestiaryRequest {
    @NotBlank(message = "O nome do monstro/criatura é obrigatório")
    private String name;

    @Builder.Default
    private String category = "MONSTRO";

    @Builder.Default
    private Integer pv = 1;

    @Builder.Default
    private Integer ip = 0;

    private String movement;
    private java.util.Map<String, Object> attributes;
    private java.util.List<Object> abilities;
    private String portraitUrl;
    private UUID campaignId;
}
