package com.chronicles.repository;

import com.chronicles.domain.CampaignPlayer;
import com.chronicles.domain.CampaignPlayerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignPlayerRepository extends JpaRepository<CampaignPlayer, CampaignPlayerId> {
    List<CampaignPlayer> findAllByCampaignId(UUID campaignId);
    boolean existsByCampaignIdAndUserId(UUID campaignId, UUID userId);
}
