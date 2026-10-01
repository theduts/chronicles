package com.chronicles.repository;

import com.chronicles.domain.CampaignChronicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignChronicleRepository extends JpaRepository<CampaignChronicle, UUID> {
    List<CampaignChronicle> findByCampaignIdOrderBySessionNumberAsc(UUID campaignId);
    List<CampaignChronicle> findByCampaignId(UUID campaignId);
    Optional<CampaignChronicle> findByIdAndCampaignId(UUID id, UUID campaignId);
    boolean existsByCampaignIdAndSessionNumber(UUID campaignId, Integer sessionNumber);
    void deleteAllByCampaignId(UUID campaignId);
}
