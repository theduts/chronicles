package com.chronicles.dto.bestiary;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BestiaryResponse {
    private UUID id;
    private String name;
    private String category;
    private Integer pv;
    private Integer ip;
    private String movement;
    private java.util.Map<String, Object> attributes;
    private java.util.List<Object> abilities;
    private String portraitUrl;
    private Boolean isOfficial;
    private UUID campaignId;
    private Instant createdAt;
    private Instant updatedAt;
}
