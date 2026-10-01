package com.chronicles.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignLoreDTO {
    private UUID id;
    private UUID campaignId;
    private String category;
    private String title;
    private String description;
    private String imageUrl;
    private Boolean isVisible;
    private Map<String, Object> data;
    private Instant createdAt;
    private Instant updatedAt;
}
