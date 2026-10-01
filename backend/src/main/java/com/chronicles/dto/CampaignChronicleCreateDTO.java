package com.chronicles.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignChronicleCreateDTO {

    @NotNull(message = "O número da sessão é obrigatório")
    private Integer sessionNumber;

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 200, message = "O título não pode exceder 200 caracteres")
    private String title;

    private LocalDate sessionDate;

    @Size(max = 150, message = "O local não pode exceder 150 caracteres")
    private String location;

    @Size(max = 255, message = "A missão não pode exceder 255 caracteres")
    private String mission;

    private String illustrationUrl;

    @NotBlank(message = "A narrativa é obrigatória")
    private String narrative;
}
