package com.chronicles.dto.review;

import com.chronicles.domain.ReviewTicketStatus;
import com.fasterxml.jackson.databind.JsonNode;
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
public class ReviewTicketResponse {
    private UUID id;
    private Long ticketNumber;
    private UUID characterId;
    private String characterName;
    private UUID campaignId;
    private UUID playerId;
    private String playerName;
    private UUID reviewerId;
    private String reviewerName;
    private ReviewTicketStatus status;
    private JsonNode changes;
    private String dmFeedback;
    private Instant createdAt;
    private Instant reviewedAt;
}
