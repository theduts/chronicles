package com.chronicles.repository;

import com.chronicles.domain.CampaignNpc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignNpcRepository extends JpaRepository<CampaignNpc, UUID> {
    List<CampaignNpc> findByCampaignIdOrderByCreatedAtDesc(UUID campaignId);
    List<CampaignNpc> findByCampaignIdAndIsPersonaTrueOrderByCreatedAtDesc(UUID campaignId);
    List<CampaignNpc> findByCampaignIdAndIsTemplateTrueOrderByCreatedAtDesc(UUID campaignId);
    Optional<CampaignNpc> findByIdAndCampaignId(UUID id, UUID campaignId);
}
