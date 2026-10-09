package com.chronicles.service;

import com.chronicles.domain.*;
import com.chronicles.dto.CampaignNpcCreateDTO;
import com.chronicles.dto.CampaignNpcDTO;
import com.chronicles.repository.CampaignLoreRepository;
import com.chronicles.repository.CampaignNpcRepository;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CampaignNpcService {

    private final CampaignRepository campaignRepository;
    private final CampaignPlayerRepository campaignPlayerRepository;
    private final CampaignNpcRepository campaignNpcRepository;
    private final CampaignLoreRepository campaignLoreRepository;

    @Transactional(readOnly = true)
    public List<CampaignNpcDTO> getNpcsByCampaign(UUID campaignId, User user) {
        return getNpcsByCampaign(campaignId, false, false, user);
    }

    @Transactional(readOnly = true)
    public List<CampaignNpcDTO> getNpcsByCampaign(UUID campaignId, Boolean personaOnly, Boolean templateOnly, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, false);
        boolean isDm = isDm(campaign, user);

        List<CampaignNpc> npcs;
        if (Boolean.TRUE.equals(personaOnly)) {
            npcs = campaignNpcRepository.findByCampaignIdAndIsPersonaTrueOrderByCreatedAtDesc(campaignId);
        } else if (Boolean.TRUE.equals(templateOnly)) {
            npcs = campaignNpcRepository.findByCampaignIdAndIsTemplateTrueOrderByCreatedAtDesc(campaignId);
        } else {
            npcs = campaignNpcRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);
        }

        return npcs.stream().map(npc -> toDTO(npc, isDm)).toList();
    }

    @Transactional(readOnly = true)
    public CampaignNpcDTO getNpcById(UUID campaignId, UUID npcId, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, false);
        boolean isDm = isDm(campaign, user);

        CampaignNpc npc = campaignNpcRepository.findByIdAndCampaignId(npcId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "NPC não encontrado"));

        return toDTO(npc, isDm);
    }

    @Transactional
    public CampaignNpcDTO createNpc(UUID campaignId, CampaignNpcCreateDTO request, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, true);

        CampaignNpc npc = CampaignNpc.builder()
                .campaign(campaign)
                .name(request.getName().trim())
                .race(request.getRace() != null ? request.getRace().trim() : null)
                .occupation(request.getOccupation() != null ? request.getOccupation().trim() : null)
                .description(request.getDescription())
                .notes(request.getNotes())
                .portraitUrl(request.getPortraitUrl())
                .isPersona(Boolean.TRUE.equals(request.getIsPersona()))
                .data(request.getData() != null ? request.getData() : new HashMap<>())
                .isTemplate(Boolean.TRUE.equals(request.getIsTemplate()))
                .build();

        CampaignNpc savedNpc = campaignNpcRepository.save(npc);

        if (Boolean.TRUE.equals(savedNpc.getIsPersona())) {
            syncNpcToCampaignLore(campaign, savedNpc);
        }

        return toDTO(savedNpc, true);
    }

    @Transactional
    public CampaignNpcDTO updateNpc(UUID campaignId, UUID npcId, CampaignNpcCreateDTO request, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, true);

        CampaignNpc npc = campaignNpcRepository.findByIdAndCampaignId(npcId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "NPC não encontrado"));

        npc.setName(request.getName().trim());
        npc.setRace(request.getRace() != null ? request.getRace().trim() : null);
        npc.setOccupation(request.getOccupation() != null ? request.getOccupation().trim() : null);
        npc.setDescription(request.getDescription());
        npc.setNotes(request.getNotes());
        npc.setPortraitUrl(request.getPortraitUrl());

        if (request.getIsPersona() != null) {
            npc.setIsPersona(request.getIsPersona());
        }
        if (request.getData() != null) {
            npc.setData(request.getData());
        }
        if (request.getIsTemplate() != null) {
            npc.setIsTemplate(request.getIsTemplate());
        }

        CampaignNpc savedNpc = campaignNpcRepository.save(npc);

        if (Boolean.TRUE.equals(savedNpc.getIsPersona())) {
            syncNpcToCampaignLore(campaign, savedNpc);
        }

        return toDTO(savedNpc, true);
    }

    @Transactional
    public void deleteNpc(UUID campaignId, UUID npcId, User user) {
        validateCampaignAccess(campaignId, user, true);

        CampaignNpc npc = campaignNpcRepository.findByIdAndCampaignId(npcId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "NPC não encontrado"));

        campaignNpcRepository.delete(npc);
    }

    @Transactional
    public CampaignNpcDTO promoteToPersona(UUID campaignId, UUID npcId, User user) {
        Campaign campaign = validateCampaignAccess(campaignId, user, true);

        CampaignNpc npc = campaignNpcRepository.findByIdAndCampaignId(npcId, campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "NPC não encontrado"));

        npc.setIsPersona(true);
        CampaignNpc savedNpc = campaignNpcRepository.save(npc);

        syncNpcToCampaignLore(campaign, savedNpc);

        return toDTO(savedNpc, true);
    }

    private void syncNpcToCampaignLore(Campaign campaign, CampaignNpc npc) {
        String npcIdStr = npc.getId().toString();
        List<CampaignLore> personas = campaignLoreRepository.findByCampaignId(campaign.getId()).stream()
                .filter(l -> "persona".equalsIgnoreCase(l.getCategory()) &&
                        l.getData() != null &&
                        npcIdStr.equals(String.valueOf(l.getData().get("npcId"))))
                .toList();

        Map<String, Object> data = new HashMap<>();
        String raceDisplay = (npc.getRace() != null && !npc.getRace().isBlank()) ? npc.getRace() : "Desconhecido";
        String occDisplay = (npc.getOccupation() != null && !npc.getOccupation().isBlank()) ? npc.getOccupation() : "Sem papel";
        data.put("title", raceDisplay + " • " + occDisplay);
        data.put("role", npc.getOccupation() != null ? npc.getOccupation() : "");
        data.put("race", npc.getRace() != null ? npc.getRace() : "");
        data.put("npcId", npcIdStr);

        CampaignLore loreEntry;
        if (!personas.isEmpty()) {
            loreEntry = personas.get(0);
            loreEntry.setTitle(npc.getName());
            loreEntry.setDescription(npc.getDescription());
            loreEntry.setImageUrl(npc.getPortraitUrl());
            loreEntry.setData(data);
        } else {
            loreEntry = CampaignLore.builder()
                    .campaign(campaign)
                    .category("persona")
                    .title(npc.getName())
                    .description(npc.getDescription())
                    .imageUrl(npc.getPortraitUrl())
                    .isVisible(true)
                    .data(data)
                    .build();
        }

        campaignLoreRepository.save(loreEntry);
    }

    private boolean isDm(Campaign campaign, User user) {
        return campaign.getDm().getId().equals(user.getId()) || user.getRole() == Role.ROLE_ADMIN;
    }

    private Campaign validateCampaignAccess(UUID campaignId, User user, boolean dmOnly) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        boolean isDm = isDm(campaign, user);

        if (dmOnly && !isDm) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre pode realizar esta operação");
        }

        if (!isDm) {
            boolean isPlayer = campaignPlayerRepository.existsByCampaignIdAndUserId(campaignId, user.getId());
            if (!isPlayer) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta campanha");
            }
        }

        return campaign;
    }

    private CampaignNpcDTO toDTO(CampaignNpc npc, boolean isDm) {
        return CampaignNpcDTO.builder()
                .id(npc.getId())
                .campaignId(npc.getCampaign().getId())
                .name(npc.getName())
                .race(npc.getRace())
                .occupation(npc.getOccupation())
                .description(npc.getDescription())
                .notes(isDm ? npc.getNotes() : null) // Oculta notas secretas do mestre para jogadores
                .portraitUrl(npc.getPortraitUrl())
                .isPersona(npc.getIsPersona())
                .data(isDm ? (npc.getData() != null ? npc.getData() : new HashMap<>()) : null) // Oculta dados de combate para jogadores
                .isTemplate(npc.getIsTemplate())
                .createdAt(npc.getCreatedAt())
                .updatedAt(npc.getUpdatedAt())
                .build();
    }
}
