package com.chronicles.service;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.Character;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.domain.jsonb.CharacterSheet;
import com.chronicles.dto.character.CharacterRequest;
import com.chronicles.dto.character.CharacterResponse;
import com.chronicles.mapper.CharacterMapper;
import com.chronicles.repository.CampaignRepository;
import com.chronicles.repository.CharacterRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class CharacterService {

    private static final Map<Integer, Integer> XP_BY_LEVEL = Map.ofEntries(
            Map.entry(1, 0),
            Map.entry(2, 5),
            Map.entry(3, 15),
            Map.entry(4, 30),
            Map.entry(5, 50),
            Map.entry(6, 80),
            Map.entry(7, 120),
            Map.entry(8, 180),
            Map.entry(9, 250),
            Map.entry(10, 400),
            Map.entry(11, 550),
            Map.entry(12, 800),
            Map.entry(13, 1100),
            Map.entry(14, 1600),
            Map.entry(15, 2200)
    );

    private final CharacterRepository characterRepository;
    private final CampaignRepository campaignRepository;
    private final CharacterMapper characterMapper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<CharacterResponse> getCharactersForUser(User user) {
        return getCharactersForUser(user, null);
    }

    @Transactional(readOnly = true)
    public List<CharacterResponse> getCharactersForUser(User user, String role) {
        List<Character> characters;
        if ("dm".equalsIgnoreCase(role) || "mestre".equalsIgnoreCase(role)) {
            characters = characterRepository.findAllForDm(user.getId());
        } else {
            // Default: player sees only their own characters
            characters = characterRepository.findAllByUserId(user.getId());
        }

        return characters.stream()
                .map(characterMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CharacterResponse getCharacterById(UUID id, User user) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        boolean isOwner = character.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        boolean isDm = character.getCampaignId() != null && campaignRepository.existsByIdAndDmId(character.getCampaignId(), user.getId());

        if (!isOwner && !isAdmin && !isDm) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso não autorizado a este personagem");
        }

        return characterMapper.toResponse(character);
    }

    @Transactional
    public CharacterResponse createCharacter(CharacterRequest request, User user) {
        CharacterSheet sheet = characterMapper.extractSheet(request);

        Character character = Character.builder()
                .user(user)
                .campaignId(request.getCampaignId())
                .name(request.getName().trim())
                .race(request.getRace())
                .classKit(request.getClassKit())
                .currentLevel(request.getLevel() != null ? request.getLevel() : 1)
                .xp(request.getXp() != null ? request.getXp() : 0)
                .portraitUrl(request.getPortraitUrl())
                .isPendingReview(false)
                .sheet(sheet)
                .build();

        Character saved = characterRepository.save(character);
        return characterMapper.toResponse(saved);
    }

    @Transactional
    public CharacterResponse updateCharacter(UUID id, CharacterRequest request, User user) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        if (!character.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o proprietário pode alterar a ficha");
        }

        character.setName(request.getName().trim());
        character.setRace(request.getRace());
        character.setClassKit(request.getClassKit());
        if (request.getLevel() != null) character.setCurrentLevel(request.getLevel());
        if (request.getXp() != null) character.setXp(request.getXp());
        character.setPortraitUrl(request.getPortraitUrl());
        character.setCampaignId(request.getCampaignId());

        CharacterSheet updatedSheet = characterMapper.extractSheet(request);
        character.setSheet(updatedSheet);

        Character saved = characterRepository.save(character);
        return characterMapper.toResponse(saved);
    }

    @Transactional
    public void deleteCharacter(UUID id, User user) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        if (!character.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o proprietário pode remover o personagem");
        }

        characterRepository.delete(character);
    }

    @Transactional
    public CharacterResponse submitForReview(UUID id, CharacterRequest request, User user) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        if (!character.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o proprietário pode submeter para revisão");
        }

        if (request.getCampaignId() != null) {
            character.setCampaignId(request.getCampaignId());
        }

        CharacterSheet proposed = characterMapper.extractSheet(request);
        character.setProposedSheet(proposed);
        character.setIsPendingReview(true);

        Character saved = characterRepository.save(character);
        return characterMapper.toResponse(saved);
    }

    @Transactional
    public CharacterResponse levelUpCharacter(UUID id, CharacterRequest request, User user) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        if (character.getCampaignId() == null) {
            if (request != null && request.getCampaignId() != null) {
                character.setCampaignId(request.getCampaignId());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este personagem não está atrelado a nenhuma campanha");
            }
        }

        Campaign campaign = campaignRepository.findById(character.getCampaignId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        if (!campaign.getDm().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre da campanha em que o personagem está atrelado pode evoluir o personagem");
        }

        if (character.getCurrentLevel() >= 15) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O personagem já atingiu o nível máximo (15)");
        }

        int nextLevel = character.getCurrentLevel() + 1;
        int reqXp = XP_BY_LEVEL.getOrDefault(nextLevel, 0);
        int currentXp = character.getXp() != null ? character.getXp() : 0;
        if (request != null && request.getXp() != null) {
            currentXp = Math.max(currentXp, request.getXp());
        }
        int updatedXp = Math.max(currentXp, reqXp);

        // Snapshot current level sheet for rollback capability
        if (character.getSheet() != null) {
            try {
                CharacterSheet snapshot = objectMapper.readValue(
                        objectMapper.writeValueAsString(character.getSheet()),
                        CharacterSheet.class
                );
                character.setSheetLastLevel(snapshot);
            } catch (Exception e) {
                character.setSheetLastLevel(character.getSheet());
            }
        }

        if (request != null) {
            CharacterSheet sheet = characterMapper.extractSheet(request);
            sheet.setLevel(nextLevel);
            sheet.setXp(updatedXp);
            character.setSheet(sheet);
            if (request.getName() != null && !request.getName().isBlank()) {
                character.setName(request.getName().trim());
            }
            if (request.getRace() != null) character.setRace(request.getRace());
            if (request.getClassKit() != null) character.setClassKit(request.getClassKit());
            if (request.getPortraitUrl() != null) character.setPortraitUrl(request.getPortraitUrl());
        } else {
            CharacterSheet sheet = character.getSheet();
            if (sheet != null) {
                sheet.setLevel(nextLevel);
                sheet.setXp(updatedXp);
            }
        }

        character.setCurrentLevel(nextLevel);
        character.setXp(updatedXp);
        character.setIsPendingReview(false);
        character.setProposedSheet(null);

        Character saved = characterRepository.save(character);
        return characterMapper.toResponse(saved);
    }
}

