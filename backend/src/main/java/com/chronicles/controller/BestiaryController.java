package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.bestiary.BestiaryRequest;
import com.chronicles.dto.bestiary.BestiaryResponse;
import com.chronicles.service.BestiaryService;
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
@RequestMapping("/api/bestiary")
@RequiredArgsConstructor
@Tag(name = "Bestiary", description = "Endpoints para consulta do catálogo de criaturas oficiais e customizadas da campanha")
@SecurityRequirement(name = "bearerAuth")
public class BestiaryController {

    private final BestiaryService bestiaryService;

    @GetMapping
    @Operation(summary = "Listar criaturas do bestiário", description = "Retorna monstros oficiais do sistema ou adiciona os monstros da campanha se campaignId for fornecido.")
    public ResponseEntity<List<BestiaryResponse>> getMonsters(@RequestParam(required = false) UUID campaignId) {
        return ResponseEntity.ok(bestiaryService.getMonsters(campaignId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter criatura por ID", description = "Retorna os detalhes de combate, atributos e habilidades de um monstro.")
    public ResponseEntity<BestiaryResponse> getMonsterById(@PathVariable UUID id) {
        return ResponseEntity.ok(bestiaryService.getMonsterById(id));
    }

    @PostMapping
    @Operation(summary = "Criar monstro para a campanha", description = "Adiciona uma nova criatura customizada ao bestiário da campanha.")
    public ResponseEntity<BestiaryResponse> createMonster(
            @Valid @RequestBody BestiaryRequest request,
            @AuthenticationPrincipal User user
    ) {
        BestiaryResponse response = bestiaryService.createMonster(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar monstro da campanha", description = "Atualiza estatísticas de um monstro criado para a campanha.")
    public ResponseEntity<BestiaryResponse> updateMonster(
            @PathVariable UUID id,
            @Valid @RequestBody BestiaryRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(bestiaryService.updateMonster(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir monstro da campanha", description = "Remove uma criatura criada para a campanha.")
    public ResponseEntity<Void> deleteMonster(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        bestiaryService.deleteMonster(id, user);
        return ResponseEntity.noContent().build();
    }
}
