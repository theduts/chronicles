package com.chronicles.service;

import com.chronicles.domain.Character;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.domain.jsonb.CharacterSheet;
import com.chronicles.dto.character.CharacterRequest;
import com.chronicles.dto.character.CharacterResponse;
import com.chronicles.mapper.CharacterMapper;
import com.chronicles.repository.CharacterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CharacterService {

    private final CharacterRepository characterRepository;
    private final CharacterMapper characterMapper;

    @Transactional(readOnly = true)
    public List<CharacterResponse> getCharactersForUser(User user) {
        return characterRepository.findAllByUserId(user.getId())
                .stream()
                .map(characterMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CharacterResponse getCharacterById(UUID id, User user) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Personagem não encontrado"));

        if (!character.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
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

        CharacterSheet proposed = characterMapper.extractSheet(request);
        character.setProposedSheet(proposed);
        character.setIsPendingReview(true);

        Character saved = characterRepository.save(character);
        return characterMapper.toResponse(saved);
    }
}
