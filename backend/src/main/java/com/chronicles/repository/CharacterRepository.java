package com.chronicles.repository;

import com.chronicles.domain.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CharacterRepository extends JpaRepository<Character, UUID> {
    List<Character> findAllByUserId(UUID userId);
    Optional<Character> findByIdAndUserId(UUID id, UUID userId);
    List<Character> findAllByCampaignId(UUID campaignId);
    List<Character> findAllByCampaignIdAndIsPendingReviewTrue(UUID campaignId);

    @Query("SELECT DISTINCT c FROM Character c WHERE c.campaignId IS NOT NULL AND c.campaignId IN (SELECT camp.id FROM Campaign camp WHERE camp.dm.id = :userId) AND c.user.id != :userId")
    List<Character> findAllForDm(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT c FROM Character c WHERE c.user.id = :userId OR (c.campaignId IS NOT NULL AND c.campaignId IN (SELECT camp.id FROM Campaign camp WHERE camp.dm.id = :userId))")
    List<Character> findAllForUserOrDm(@Param("userId") UUID userId);
}
