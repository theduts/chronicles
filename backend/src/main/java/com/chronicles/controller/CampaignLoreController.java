package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.CampaignLoreCreateDTO;
import com.chronicles.dto.CampaignLoreDTO;
import com.chronicles.service.CampaignLoreService;
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
@RequestMapping("/api/campaigns/{campaignId}/lore")
@RequiredArgsConstructor
@Tag(name = "Campaign Lore", description = "Endpoints para gerenciamento de artigos e enciclopédia da campanha")
@SecurityRequirement(name = "bearerAuth")
public class CampaignLoreController {

    private final CampaignLoreService campaignLoreService;

    @GetMapping
    @Operation(summary = "Listar artigos de lore", description = "Retorna todos os artigos da campanha. Mestres visualizam todos os itens; jogadores apenas os visíveis.")
    public ResponseEntity<List<CampaignLoreDTO>> getLoreByCampaign(
            @PathVariable UUID campaignId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignLoreService.getLoreByCampaign(campaignId, user));
    }

    @GetMapping("/{loreId}")
    @Operation(summary = "Obter artigo de lore", description = "Retorna os detalhes de um artigo específico.")
    public ResponseEntity<CampaignLoreDTO> getLoreById(
            @PathVariable UUID campaignId,
            @PathVariable UUID loreId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignLoreService.getLoreById(campaignId, loreId, user));
    }

    @PostMapping
    @Operation(summary = "Criar artigo de lore", description = "Cria um novo artigo de lore para a campanha (somente Mestre).")
    public ResponseEntity<CampaignLoreDTO> createLore(
            @PathVariable UUID campaignId,
            @Valid @RequestBody CampaignLoreCreateDTO request,
            @AuthenticationPrincipal User user
    ) {
        CampaignLoreDTO response = campaignLoreService.createLore(campaignId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{loreId}")
    @Operation(summary = "Atualizar artigo de lore", description = "Atualiza os campos e dados JSONB de um artigo existente (somente Mestre).")
    public ResponseEntity<CampaignLoreDTO> updateLore(
            @PathVariable UUID campaignId,
            @PathVariable UUID loreId,
            @Valid @RequestBody CampaignLoreCreateDTO request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignLoreService.updateLore(campaignId, loreId, request, user));
    }

    @PatchMapping("/{loreId}/visibility")
    @Operation(summary = "Alternar visibilidade do artigo", description = "Altera rapidamente a visibilidade do artigo para jogadores (somente Mestre).")
    public ResponseEntity<CampaignLoreDTO> updateLoreVisibility(
            @PathVariable UUID campaignId,
            @PathVariable UUID loreId,
            @RequestParam Boolean isVisible,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignLoreService.updateLoreVisibility(campaignId, loreId, isVisible, user));
    }

    @DeleteMapping("/{loreId}")
    @Operation(summary = "Excluir artigo de lore", description = "Remove permanentemente um artigo de lore (somente Mestre).")
    public ResponseEntity<Void> deleteLore(
            @PathVariable UUID campaignId,
            @PathVariable UUID loreId,
            @AuthenticationPrincipal User user
    ) {
        campaignLoreService.deleteLore(campaignId, loreId, user);
        return ResponseEntity.noContent().build();
    }
}
