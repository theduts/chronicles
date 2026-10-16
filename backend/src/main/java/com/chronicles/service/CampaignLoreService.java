package com.chronicles.service;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.CampaignLore;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.CampaignLoreCreateDTO;
import com.chronicles.dto.CampaignLoreDTO;
import com.chronicles.repository.CampaignLoreRepository;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignLoreService {

    private final CampaignRepository campaignRepository;
    private final CampaignPlayerRepository campaignPlayerRepository;
    private final CampaignLoreRepository campaignLoreRepository;

    @Transactional(readOnly = true)
    public List<CampaignLoreDTO> getLoreByCampaign(UUID campaignId, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, false);
        boolean isDm = campaign.getDm().getId().equals(user.getId()) || user.getRole() == Role.ROLE_ADMIN;

        List<CampaignLore> items = isDm
                ? campaignLoreRepository.findByCampaignId(campaignId)
                : campaignLoreRepository.findByCampaignIdAndIsVisibleTrue(campaignId);

        return items.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public CampaignLoreDTO getLoreById(UUID campaignId, UUID loreId, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, false);
        boolean isDm = campaign.getDm().getId().equals(user.getId()) || user.getRole() == Role.ROLE_ADMIN;

        CampaignLore lore = campaignLoreRepository.findByIdAndCampaignId(loreId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artigo de Lore não encontrado"));

        if (!isDm && Boolean.FALSE.equals(lore.getIsVisible())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Artigo de Lore não encontrado");
        }

        return toDTO(lore);
    }

    @Transactional
    public CampaignLoreDTO createLore(UUID campaignId, CampaignLoreCreateDTO request, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, true);

        CampaignLore lore = CampaignLore.builder()
                .campaign(campaign)
                .category(request.getCategory().trim().toLowerCase())
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .data(request.getData() != null ? request.getData() : Collections.emptyMap())
                .build();

        return toDTO(campaignLoreRepository.save(lore));
    }

    @Transactional
    public CampaignLoreDTO updateLore(UUID campaignId, UUID loreId, CampaignLoreCreateDTO request, User user) {
        validateCampaignAccess(campaignId, user, true);

        CampaignLore lore = campaignLoreRepository.findByIdAndCampaignId(loreId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artigo de Lore não encontrado"));

        lore.setCategory(request.getCategory().trim().toLowerCase());
        lore.setTitle(request.getTitle().trim());
        lore.setDescription(request.getDescription());
        lore.setImageUrl(request.getImageUrl());
        if (request.getIsVisible() != null) {
            lore.setIsVisible(request.getIsVisible());
        }
        if (request.getData() != null) {
            lore.setData(request.getData());
        }

        return toDTO(campaignLoreRepository.save(lore));
    }

    @Transactional
    public CampaignLoreDTO updateLoreVisibility(UUID campaignId, UUID loreId, Boolean isVisible, User user) {
        validateCampaignAccess(campaignId, user, true);

        CampaignLore lore = campaignLoreRepository.findByIdAndCampaignId(loreId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artigo de Lore não encontrado"));

        lore.setIsVisible(isVisible != null ? isVisible : true);
        return toDTO(campaignLoreRepository.save(lore));
    }

    @Transactional
    public void deleteLore(UUID campaignId, UUID loreId, User user) {
        validateCampaignAccess(campaignId, user, true);

        CampaignLore lore = campaignLoreRepository.findByIdAndCampaignId(loreId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artigo de Lore não encontrado"));

        campaignLoreRepository.delete(lore);
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

    private CampaignLoreDTO toDTO(CampaignLore lore) {
        return CampaignLoreDTO.builder()
                .id(lore.getId())
                .campaignId(lore.getCampaign().getId())
                .category(lore.getCategory())
                .title(lore.getTitle())
                .description(lore.getDescription())
                .imageUrl(lore.getImageUrl())
                .isVisible(lore.getIsVisible())
                .data(lore.getData())
                .createdAt(lore.getCreatedAt())
                .updatedAt(lore.getUpdatedAt())
                .build();
    }
}
