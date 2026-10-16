package com.chronicles.service;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.Character;
import com.chronicles.domain.CharacterReviewTicket;
import com.chronicles.domain.ReviewTicketStatus;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.domain.jsonb.CharacterSheet;
import com.chronicles.dto.review.ReviewTicketResponse;
import com.chronicles.repository.CampaignRepository;
import com.chronicles.repository.CharacterReviewTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewTicketService {

    private final CharacterReviewTicketRepository ticketRepository;
    private final CampaignRepository campaignRepository;
    private final SheetDiffCalculator diffCalculator;

    /**
     * Abre um ticket PENDING para a submissão. Se já existir um ticket pendente para o personagem,
     * ele é atualizado com o novo delta (reenvio) em vez de duplicado.
     */
    @Transactional
    public CharacterReviewTicket openTicket(Character character, CharacterSheet proposed, User player) {
        var changes = diffCalculator.diff(character.getSheet(), proposed);

        CharacterReviewTicket ticket = ticketRepository
                .findByCharacterIdAndStatus(character.getId(), ReviewTicketStatus.PENDING)
                .stream().findFirst()
                .orElseGet(() -> CharacterReviewTicket.builder()
                        .character(character)
                        .player(character.getUser() != null ? character.getUser() : player)
                        .build());

        ticket.setCampaignId(character.getCampaignId());
        ticket.setChanges(changes);
        return ticketRepository.save(ticket);
    }

    /** Fecha o ticket pendente do personagem (se houver) com a decisão do Mestre. */
    @Transactional
    public void resolvePending(UUID characterId, ReviewTicketStatus decision, User reviewer, String dmFeedback) {
        ticketRepository.findByCharacterIdAndStatus(characterId, ReviewTicketStatus.PENDING).forEach(ticket -> {
            ticket.setStatus(decision);
            ticket.setReviewer(reviewer);
            ticket.setDmFeedback(dmFeedback == null || dmFeedback.isBlank() ? null : dmFeedback.trim());
            ticket.setReviewedAt(Instant.now());
            ticketRepository.save(ticket);
        });
    }

    @Transactional(readOnly = true)
    public List<ReviewTicketResponse> getTicketsForCampaign(UUID campaignId, User user) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        if (!campaign.getDm().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre da campanha pode ver os pedidos de análise");
        }

        return ticketRepository.findAllByCampaignIdOrderByCreatedAtDesc(campaignId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewTicketResponse> getTicketsForPlayer(User user) {
        return ticketRepository.findAllByPlayerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewTicketResponse toResponse(CharacterReviewTicket t) {
        return ReviewTicketResponse.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .characterId(t.getCharacter().getId())
                .characterName(t.getCharacter().getName())
                .campaignId(t.getCampaignId())
                .playerId(t.getPlayer().getId())
                .playerName(t.getPlayer().getUsername())
                .reviewerId(t.getReviewer() != null ? t.getReviewer().getId() : null)
                .reviewerName(t.getReviewer() != null ? t.getReviewer().getUsername() : null)
                .status(t.getStatus())
                .changes(t.getChanges())
                .dmFeedback(t.getDmFeedback())
                .createdAt(t.getCreatedAt())
                .reviewedAt(t.getReviewedAt())
                .build();
    }
}
