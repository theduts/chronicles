package com.chronicles.dto.note;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NoteResponse {
    private UUID id;
    private String title;
    private String content;
    private String meta;
    private UUID campaignId;
    private UUID userId;
    private Instant createdAt;
    private Instant updatedAt;
}
