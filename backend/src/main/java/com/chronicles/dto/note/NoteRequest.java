package com.chronicles.dto.note;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteRequest {
    @NotBlank(message = "O título da anotação é obrigatório")
    private String title;

    @NotBlank(message = "O conteúdo da anotação é obrigatório")
    private String content;

    private UUID campaignId;
}
