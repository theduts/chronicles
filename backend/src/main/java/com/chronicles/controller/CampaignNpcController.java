package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.CampaignNpcCreateDTO;
import com.chronicles.dto.CampaignNpcDTO;
import com.chronicles.service.CampaignNpcService;
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
@RequestMapping("/api/campaigns/{campaignId}/npcs")
@RequiredArgsConstructor
@Tag(name = "Campaign NPCs", description = "Endpoints para gerenciamento de NPCs da campanha")
@SecurityRequirement(name = "bearerAuth")
public class CampaignNpcController {

    private final CampaignNpcService campaignNpcService;

    @GetMapping
    @Operation(summary = "Listar NPCs da campanha", description = "Retorna todos os NPCs vinculados à campanha.")
    public ResponseEntity<List<CampaignNpcDTO>> getNpcsByCampaign(
            @PathVariable UUID campaignId,
            @RequestParam(required = false, defaultValue = "false") Boolean personaOnly,
            @RequestParam(required = false, defaultValue = "false") Boolean templateOnly,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignNpcService.getNpcsByCampaign(campaignId, personaOnly, templateOnly, user));
    }

    @GetMapping("/{npcId}")
    @Operation(summary = "Obter NPC específico", description = "Retorna os detalhes de um NPC.")
    public ResponseEntity<CampaignNpcDTO> getNpcById(
            @PathVariable UUID campaignId,
            @PathVariable UUID npcId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignNpcService.getNpcById(campaignId, npcId, user));
    }

    @PostMapping
    @Operation(summary = "Criar novo NPC", description = "Cria um novo NPC para a campanha (somente Mestre).")
    public ResponseEntity<CampaignNpcDTO> createNpc(
            @PathVariable UUID campaignId,
            @Valid @RequestBody CampaignNpcCreateDTO request,
            @AuthenticationPrincipal User user
    ) {
        CampaignNpcDTO response = campaignNpcService.createNpc(campaignId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{npcId}")
    @Operation(summary = "Atualizar NPC", description = "Atualiza os dados de um NPC existente (somente Mestre).")
    public ResponseEntity<CampaignNpcDTO> updateNpc(
            @PathVariable UUID campaignId,
            @PathVariable UUID npcId,
            @Valid @RequestBody CampaignNpcCreateDTO request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignNpcService.updateNpc(campaignId, npcId, request, user));
    }

    @DeleteMapping("/{npcId}")
    @Operation(summary = "Excluir NPC", description = "Remove um NPC da campanha (somente Mestre).")
    public ResponseEntity<Void> deleteNpc(
            @PathVariable UUID campaignId,
            @PathVariable UUID npcId,
            @AuthenticationPrincipal User user
    ) {
        campaignNpcService.deleteNpc(campaignId, npcId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{npcId}/promote")
    @Operation(summary = "Promover NPC a Persona", description = "Promove o NPC a Persona da campanha, persistindo-o também na Lore (somente Mestre).")
    public ResponseEntity<CampaignNpcDTO> promoteToPersona(
            @PathVariable UUID campaignId,
            @PathVariable UUID npcId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignNpcService.promoteToPersona(campaignId, npcId, user));
    }
}
