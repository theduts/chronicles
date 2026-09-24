package com.chronicles.service;

import com.chronicles.domain.BestiaryMonster;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.bestiary.BestiaryRequest;
import com.chronicles.dto.bestiary.BestiaryResponse;
import com.chronicles.repository.BestiaryMonsterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BestiaryService {

    private final BestiaryMonsterRepository bestiaryMonsterRepository;

    @Transactional(readOnly = true)
    public List<BestiaryResponse> getMonsters(UUID campaignId) {
        List<BestiaryMonster> monsters;
        if (campaignId != null) {
            monsters = bestiaryMonsterRepository.findAllAvailableForCampaign(campaignId);
        } else {
            monsters = bestiaryMonsterRepository.findAllByIsOfficialTrueOrderByNameAsc();
        }

        return monsters.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BestiaryResponse getMonsterById(UUID id) {
        BestiaryMonster monster = bestiaryMonsterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Criatura não encontrada no bestiário"));
        return toResponse(monster);
    }

    @Transactional
    public BestiaryResponse createMonster(BestiaryRequest request, User user) {
        if (request.getCampaignId() == null && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Monstros customizados devem ser vinculados a uma campanha");
        }

        BestiaryMonster monster = BestiaryMonster.builder()
                .campaignId(request.getCampaignId())
                .name(request.getName().trim())
                .category(request.getCategory() != null ? request.getCategory() : "MONSTRO")
                .pv(request.getPv() != null ? request.getPv() : 1)
                .ip(request.getIp() != null ? request.getIp() : 0)
                .movement(request.getMovement())
                .attributes(request.getAttributes() != null ? request.getAttributes() : Map.of())
                .abilities(request.getAbilities() != null ? request.getAbilities() : List.of())
                .portraitUrl(request.getPortraitUrl())
                .isOfficial(request.getCampaignId() == null && user.getRole() == Role.ROLE_ADMIN)
                .build();

        BestiaryMonster saved = bestiaryMonsterRepository.save(monster);
        return toResponse(saved);
    }

    @Transactional
    public BestiaryResponse updateMonster(UUID id, BestiaryRequest request, User user) {
        BestiaryMonster monster = bestiaryMonsterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Criatura não encontrada no bestiário"));

        if (Boolean.TRUE.equals(monster.getIsOfficial()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é permitido alterar monstros oficiais do sistema");
        }

        monster.setName(request.getName().trim());
        if (request.getCategory() != null) monster.setCategory(request.getCategory());
        if (request.getPv() != null) monster.setPv(request.getPv());
        if (request.getIp() != null) monster.setIp(request.getIp());
        if (request.getMovement() != null) monster.setMovement(request.getMovement());
        if (request.getAttributes() != null) monster.setAttributes(request.getAttributes());
        if (request.getAbilities() != null) monster.setAbilities(request.getAbilities());
        if (request.getPortraitUrl() != null) monster.setPortraitUrl(request.getPortraitUrl());

        BestiaryMonster saved = bestiaryMonsterRepository.save(monster);
        return toResponse(saved);
    }

    @Transactional
    public void deleteMonster(UUID id, User user) {
        BestiaryMonster monster = bestiaryMonsterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Criatura não encontrada no bestiário"));

        if (Boolean.TRUE.equals(monster.getIsOfficial()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é permitido remover monstros oficiais do sistema");
        }

        bestiaryMonsterRepository.delete(monster);
    }

    private BestiaryResponse toResponse(BestiaryMonster monster) {
        return BestiaryResponse.builder()
                .id(monster.getId())
                .name(monster.getName())
                .category(monster.getCategory())
                .pv(monster.getPv())
                .ip(monster.getIp())
                .movement(monster.getMovement())
                .attributes(monster.getAttributes())
                .abilities(monster.getAbilities())
                .portraitUrl(monster.getPortraitUrl())
                .isOfficial(monster.getIsOfficial())
                .campaignId(monster.getCampaignId())
                .createdAt(monster.getCreatedAt())
                .updatedAt(monster.getUpdatedAt())
                .build();
    }
}
