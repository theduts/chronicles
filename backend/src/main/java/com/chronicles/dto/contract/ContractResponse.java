package com.chronicles.dto.contract;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponse {
    private UUID id;
    private UUID campaignId;
    private UUID createdById;
    private String title;
    private String description;
    private String status;
    private Boolean hasReward;
    private Integer rewardValue;
    private String currency;
    private String rewardItem;
    private Instant createdAt;
    private Instant updatedAt;
}
