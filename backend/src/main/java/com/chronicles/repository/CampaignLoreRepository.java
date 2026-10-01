package com.chronicles.repository;

import com.chronicles.domain.CampaignLore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignLoreRepository extends JpaRepository<CampaignLore, UUID> {
    List<CampaignLore> findByCampaignId(UUID campaignId);
    List<CampaignLore> findByCampaignIdAndIsVisibleTrue(UUID campaignId);
    Optional<CampaignLore> findByIdAndCampaignId(UUID id, UUID campaignId);
    void deleteAllByCampaignId(UUID campaignId);
}
