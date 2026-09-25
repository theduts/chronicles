package com.chronicles.service;

import com.chronicles.domain.*;
import com.chronicles.domain.Character;
import com.chronicles.dto.campaign.AddPlayerRequest;
import com.chronicles.dto.campaign.CampaignRequest;
import com.chronicles.dto.campaign.CampaignResponse;
import com.chronicles.dto.character.CharacterResponse;
import com.chronicles.mapper.CharacterMapper;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import com.chronicles.repository.CharacterRepository;
import com.chronicles.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignPlayerRepository campaignPlayerRepository;
    private final CharacterRepository characterRepository;
    private final UserRepository userRepository;
    private final CharacterMapper characterMapper;

    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaignsForUser(User user) {
        return campaignRepository.findAllForUser(user.getId())
                .stream()
                .map(c -> toResponse(c, user))
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponse getCampaignById(UUID id, User user) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        boolean isDm = campaign.getDm().getId().equals(user.getId());
        boolean isPlayer = campaignPlayerRepository.existsByCampaignIdAndUserId(id, user.getId());

        if (!isDm && !isPlayer && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta campanha");
        }

        return toResponse(campaign, user);
    }

    @Transactional
    public CampaignResponse createCampaign(CampaignRequest request, User user) {
        String inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        Campaign campaign = Campaign.builder()
                .dm(user)
                .name(request.getName().trim())
                .subtitle(request.getSubtitulo())
                .universe(request.getUniverso())
                .currentAct(request.getCurrentAct() != null ? request.getCurrentAct() : "Ato I")
                .lore(request.getLore())
                .illustrationUrl(request.getIlustracao())
                .inviteCode(inviteCode)
                .isActive(true)
                .build();

        Campaign saved = campaignRepository.save(campaign);
        return toResponse(saved, user);
    }

    @Transactional
    public CampaignResponse updateCampaign(UUID id, CampaignRequest request, User user) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        if (!campaign.getDm().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre pode alterar a campanha");
        }

        campaign.setName(request.getName().trim());
        campaign.setSubtitle(request.getSubtitulo());
        campaign.setUniverse(request.getUniverso());
        if (request.getCurrentAct() != null) campaign.setCurrentAct(request.getCurrentAct());
        campaign.setLore(request.getLore());
        campaign.setIllustrationUrl(request.getIlustracao());

        Campaign saved = campaignRepository.save(campaign);
        return toResponse(saved, user);
    }

    @Transactional
    public CampaignResponse addPlayer(UUID id, AddPlayerRequest request, User user) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        User playerToAdd;
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!campaign.getDm().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre pode convidar por e-mail");
            }
            playerToAdd = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado com o e-mail informado"));
        } else if (request.getInviteCode() != null && !request.getInviteCode().isBlank()) {
            if (!campaign.getInviteCode().equalsIgnoreCase(request.getInviteCode().trim())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código de convite inválido");
            }
            playerToAdd = user;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o e-mail do jogador ou o código de convite");
        }

        if (campaign.getDm().getId().equals(playerToAdd.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O Mestre já é o criador da campanha");
        }

        if (campaignPlayerRepository.existsByCampaignIdAndUserId(id, playerToAdd.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O jogador já faz parte desta campanha");
        }

        CampaignPlayer campaignPlayer = CampaignPlayer.builder()
                .id(new CampaignPlayerId(campaign.getId(), playerToAdd.getId()))
                .campaign(campaign)
                .user(playerToAdd)
                .build();

        campaignPlayerRepository.save(campaignPlayer);

        return toResponse(campaign, user);
    }

    @Transactional
    public CharacterResponse approveCharacter(UUID campaignId, UUID characterId, User user) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        if (!campaign.getDm().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre da campanha pode aprovar fichas");
        }

        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        if (character.getCampaignId() == null || !character.getCampaignId().equals(campaignId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este personagem não pertence a esta campanha");
        }

        if (!Boolean.TRUE.equals(character.getIsPendingReview()) || character.getProposedSheet() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não há alterações pendentes de revisão para este personagem");
        }

        // Snapshot current level sheet for rollback capability
        character.setSheetLastLevel(character.getSheet());

        // Apply proposed evolution
        character.setSheet(character.getProposedSheet());
        character.setProposedSheet(null);
        character.setIsPendingReview(false);

        Character saved = characterRepository.save(character);
        return characterMapper.toResponse(saved);
    }

    @Transactional
    public CharacterResponse rejectCharacter(UUID campaignId, UUID characterId, User user) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        if (!campaign.getDm().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre da campanha pode rejeitar fichas");
        }

        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        if (character.getCampaignId() == null || !character.getCampaignId().equals(campaignId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este personagem não pertence a esta campanha");
        }

        if (!Boolean.TRUE.equals(character.getIsPendingReview())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não há alterações pendentes de revisão para este personagem");
        }

        // Discard proposed evolution
        character.setProposedSheet(null);
        character.setIsPendingReview(false);

        Character saved = characterRepository.save(character);
        return characterMapper.toResponse(saved);
    }

    private CampaignResponse toResponse(Campaign campaign, User currentUser) {
        List<CampaignPlayer> players = campaignPlayerRepository.findAllByCampaignId(campaign.getId());
        List<String> playerEmails = players.stream()
                .map(cp -> cp.getUser().getEmail())
                .toList();

        boolean isDm = campaign.getDm().getId().equals(currentUser.getId());

        return CampaignResponse.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .dmEmail(campaign.getDm().getEmail())
                .dmId(campaign.getDm().getId())
                .players(playerEmails)
                .subtitulo(campaign.getSubtitle())
                .universo(campaign.getUniverse())
                .currentAct(campaign.getCurrentAct())
                .lore(campaign.getLore())
                .ilustracao(campaign.getIllustrationUrl())
                .inviteCode(campaign.getInviteCode())
                .isDm(isDm)
                .build();
    }
}
