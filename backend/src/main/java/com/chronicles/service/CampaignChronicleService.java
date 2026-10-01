package com.chronicles.service;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.CampaignChronicle;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.CampaignChronicleCreateDTO;
import com.chronicles.dto.CampaignChronicleDTO;
import com.chronicles.repository.CampaignChronicleRepository;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignChronicleService {

    private final CampaignRepository campaignRepository;
    private final CampaignPlayerRepository campaignPlayerRepository;
    private final CampaignChronicleRepository campaignChronicleRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<CampaignChronicleDTO> getChroniclesByCampaign(UUID campaignId, User user) {
        validateCampaignAccess(campaignId, user, false);
        List<CampaignChronicle> chronicles = campaignChronicleRepository.findByCampaignIdOrderBySessionNumberAsc(campaignId);
        return chronicles.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public CampaignChronicleDTO getChronicleById(UUID campaignId, UUID chronicleId, User user) {
        validateCampaignAccess(campaignId, user, false);
        CampaignChronicle chronicle = campaignChronicleRepository.findByIdAndCampaignId(chronicleId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Crônica não encontrada"));
        return toDTO(chronicle);
    }

    @Transactional
    public CampaignChronicleDTO createChronicle(UUID campaignId, CampaignChronicleCreateDTO request, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, true);

        if (campaignChronicleRepository.existsByCampaignIdAndSessionNumber(campaignId, request.getSessionNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma crônica para a sessão " + request.getSessionNumber());
        }

        CampaignChronicle chronicle = CampaignChronicle.builder()
                .campaign(campaign)
                .author(user)
                .sessionNumber(request.getSessionNumber())
                .title(request.getTitle().trim())
                .sessionDate(request.getSessionDate() != null ? request.getSessionDate() : LocalDate.now(clock))
                .location(request.getLocation())
                .mission(request.getMission())
                .illustrationUrl(request.getIllustrationUrl())
                .narrative(request.getNarrative())
                .build();

        return toDTO(campaignChronicleRepository.save(chronicle));
    }

    @Transactional
    public CampaignChronicleDTO updateChronicle(UUID campaignId, UUID chronicleId, CampaignChronicleCreateDTO request, User user) {
        validateCampaignAccess(campaignId, user, true);

        CampaignChronicle chronicle = campaignChronicleRepository.findByIdAndCampaignId(chronicleId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Crônica não encontrada"));

        if (!chronicle.getSessionNumber().equals(request.getSessionNumber()) &&
                campaignChronicleRepository.existsByCampaignIdAndSessionNumber(campaignId, request.getSessionNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma crônica para a sessão " + request.getSessionNumber());
        }

        chronicle.setSessionNumber(request.getSessionNumber());
        chronicle.setTitle(request.getTitle().trim());
        if (request.getSessionDate() != null) {
            chronicle.setSessionDate(request.getSessionDate());
        }
        chronicle.setLocation(request.getLocation());
        chronicle.setMission(request.getMission());
        chronicle.setIllustrationUrl(request.getIllustrationUrl());
        chronicle.setNarrative(request.getNarrative());

        return toDTO(campaignChronicleRepository.save(chronicle));
    }

    @Transactional
    public void deleteChronicle(UUID campaignId, UUID chronicleId, User user) {
        validateCampaignAccess(campaignId, user, true);

        CampaignChronicle chronicle = campaignChronicleRepository.findByIdAndCampaignId(chronicleId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Crônica não encontrada"));

        campaignChronicleRepository.delete(chronicle);
    }

    private Campaign validateCampaignAccess(UUID campaignId, User user, boolean dmOnly) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        boolean isDm = campaign.getDm().getId().equals(user.getId()) || user.getRole() == Role.ROLE_ADMIN;

        if (dmOnly) {
            if (!isDm) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre pode realizar esta operação");
            }
            return campaign;
        }

        boolean isPlayer = campaignPlayerRepository.existsByCampaignIdAndUserId(campaignId, user.getId());
        if (!isDm && !isPlayer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta campanha");
        }

        return campaign;
    }

    private CampaignChronicleDTO toDTO(CampaignChronicle chronicle) {
        return CampaignChronicleDTO.builder()
                .id(chronicle.getId())
                .campaignId(chronicle.getCampaign().getId())
                .authorId(chronicle.getAuthor().getId())
                .authorName(chronicle.getAuthor().getDisplayName())
                .sessionNumber(chronicle.getSessionNumber())
                .title(chronicle.getTitle())
                .sessionDate(chronicle.getSessionDate())
                .location(chronicle.getLocation())
                .mission(chronicle.getMission())
                .illustrationUrl(chronicle.getIllustrationUrl())
                .narrative(chronicle.getNarrative())
                .createdAt(chronicle.getCreatedAt())
                .updatedAt(chronicle.getUpdatedAt())
                .build();
    }
}
