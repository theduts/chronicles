package com.chronicles.service;

import com.chronicles.domain.Role;
import com.chronicles.domain.Spell;
import com.chronicles.domain.User;
import com.chronicles.dto.spell.SpellRequest;
import com.chronicles.dto.spell.SpellResponse;
import com.chronicles.repository.SpellRepository;
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
public class SpellService {

    private final SpellRepository spellRepository;

    @Transactional(readOnly = true)
    public List<SpellResponse> getSpells(String systemSlug, String schoolOrFocus) {
        String slug = (systemSlug != null && !systemSlug.isBlank()) ? systemSlug : "daemon";
        List<Spell> spells;
        if (schoolOrFocus != null && !schoolOrFocus.isBlank()) {
            spells = spellRepository.findAllBySystemSlugAndSchoolOrFocus(slug, schoolOrFocus.trim());
        } else {
            spells = spellRepository.findAllBySystemSlugOrderByNameAsc(slug);
        }

        return spells.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SpellResponse getSpellById(UUID id) {
        Spell spell = spellRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Magia não encontrada no grimório"));
        return toResponse(spell);
    }

    @Transactional
    public SpellResponse createSpell(SpellRequest request, User user) {
        Spell spell = Spell.builder()
                .systemSlug(request.getSystemSlug() != null ? request.getSystemSlug() : "daemon")
                .name(request.getName().trim())
                .schoolOrFocus(request.getSchoolOrFocus())
                .level(request.getLevel())
                .description(request.getDescription())
                .data(request.getData() != null ? request.getData() : Map.of())
                .isOfficial(user.getRole() == Role.ROLE_ADMIN)
                .createdBy(user)
                .build();

        Spell saved = spellRepository.save(spell);
        return toResponse(saved);
    }

    private SpellResponse toResponse(Spell spell) {
        return SpellResponse.builder()
                .id(spell.getId())
                .systemSlug(spell.getSystemSlug())
                .name(spell.getName())
                .schoolOrFocus(spell.getSchoolOrFocus())
                .level(spell.getLevel())
                .description(spell.getDescription())
                .data(spell.getData())
                .isOfficial(spell.getIsOfficial())
                .createdAt(spell.getCreatedAt())
                .updatedAt(spell.getUpdatedAt())
                .build();
    }
}
