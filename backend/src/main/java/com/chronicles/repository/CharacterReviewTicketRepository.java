package com.chronicles.repository;

import com.chronicles.domain.CharacterReviewTicket;
import com.chronicles.domain.ReviewTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CharacterReviewTicketRepository extends JpaRepository<CharacterReviewTicket, UUID> {
    List<CharacterReviewTicket> findAllByPlayerIdOrderByCreatedAtDesc(UUID playerId);
    List<CharacterReviewTicket> findAllByCampaignIdOrderByCreatedAtDesc(UUID campaignId);
    List<CharacterReviewTicket> findByCharacterIdAndStatus(UUID characterId, ReviewTicketStatus status);
}
