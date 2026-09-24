package com.chronicles.dto.spell;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpellRequest {
    @NotBlank(message = "O nome da magia é obrigatório")
    private String name;

    private String schoolOrFocus;
    private Integer level;
    private String description;
    private java.util.Map<String, Object> data;
    private String systemSlug;
}
