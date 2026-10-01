package com.chronicles.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignChronicleDTO {
    private UUID id;
    private UUID campaignId;
    private UUID authorId;
    private String authorName;
    private Integer sessionNumber;
    private String title;
    private LocalDate sessionDate;
    private String location;
    private String mission;
    private String illustrationUrl;
    private String narrative;
    private Instant createdAt;
    private Instant updatedAt;
}
