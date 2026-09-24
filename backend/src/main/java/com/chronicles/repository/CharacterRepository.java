package com.chronicles.repository;

import com.chronicles.domain.Character;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
