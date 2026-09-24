package com.chronicles.repository;

import com.chronicles.domain.BestiaryMonster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BestiaryMonsterRepository extends JpaRepository<BestiaryMonster, UUID> {
    List<BestiaryMonster> findAllByIsOfficialTrueOrderByNameAsc();
    List<BestiaryMonster> findAllByCampaignIdOrderByNameAsc(UUID campaignId);

    @Query("SELECT b FROM BestiaryMonster b WHERE b.isOfficial = true OR b.campaignId = :campaignId ORDER BY b.name ASC")
    List<BestiaryMonster> findAllAvailableForCampaign(@Param("campaignId") UUID campaignId);
}
