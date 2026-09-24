package com.chronicles.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CampaignPlayerId implements Serializable {
    @Column(name = "campaign_id")
    private UUID campaignId;

    @Column(name = "user_id")
    private UUID userId;
}
