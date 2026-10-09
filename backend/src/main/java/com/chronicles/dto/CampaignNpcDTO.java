package com.chronicles.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignNpcDTO {
    private UUID id;
    private UUID campaignId;
    private String name;
    private String race;
    private String occupation;
    private String description;
    private String notes;
    private String portraitUrl;
    private Boolean isPersona;
    private java.util.Map<String, Object> data;
    private Boolean isTemplate;
    private Instant createdAt;
    private Instant updatedAt;
}
