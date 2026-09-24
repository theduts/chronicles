package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.character.CharacterRequest;
import com.chronicles.dto.character.CharacterResponse;
import com.chronicles.service.CharacterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
@Tag(name = "Characters", description = "Endpoints para gerenciamento de fichas de personagens Daemon")
@SecurityRequirement(name = "bearerAuth")
public class CharacterController {

    private final CharacterService characterService;

    @GetMapping
    @Operation(summary = "Listar personagens do usuário", description = "Retorna todos os personagens pertencentes ao usuário autenticado.")
    public ResponseEntity<List<CharacterResponse>> getMyCharacters(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(characterService.getCharactersForUser(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter personagem por ID", description = "Retorna os detalhes completos da ficha de um personagem.")
    public ResponseEntity<CharacterResponse> getCharacterById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(characterService.getCharacterById(id, user));
    }

    @PostMapping
    @Operation(summary = "Criar novo personagem", description = "Cria uma nova ficha de personagem para o usuário autenticado.")
    public ResponseEntity<CharacterResponse> createCharacter(
            @Valid @RequestBody CharacterRequest request,
            @AuthenticationPrincipal User user
    ) {
        CharacterResponse response = characterService.createCharacter(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar personagem", description = "Atualiza os dados e a ficha do personagem existente.")
    public ResponseEntity<CharacterResponse> updateCharacter(
            @PathVariable UUID id,
            @Valid @RequestBody CharacterRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(characterService.updateCharacter(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir personagem", description = "Remove permanentemente a ficha do personagem.")
    public ResponseEntity<Void> deleteCharacter(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        characterService.deleteCharacter(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit-review")
    @Operation(summary = "Submeter para revisão do Mestre", description = "Submete alterações de evolução da ficha para aprovação do Mestre.")
    public ResponseEntity<CharacterResponse> submitForReview(
            @PathVariable UUID id,
            @Valid @RequestBody CharacterRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(characterService.submitForReview(id, request, user));
    }
}
