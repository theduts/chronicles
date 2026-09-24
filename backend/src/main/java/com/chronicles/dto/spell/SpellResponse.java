package com.chronicles.dto.spell;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpellResponse {
    private UUID id;
    private String systemSlug;
    private String name;
    private String schoolOrFocus;
    private Integer level;
    private String description;
    private java.util.Map<String, Object> data;
    private Boolean isOfficial;
    private Instant createdAt;
    private Instant updatedAt;
}
