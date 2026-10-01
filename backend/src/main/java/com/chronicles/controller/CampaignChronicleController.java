package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.CampaignChronicleCreateDTO;
import com.chronicles.dto.CampaignChronicleDTO;
import com.chronicles.service.CampaignChronicleService;
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
@RequestMapping("/api/campaigns/{campaignId}/chronicles")
@RequiredArgsConstructor
@Tag(name = "Campaign Chronicles", description = "Endpoints para gerenciamento do diário de sessões e crônicas")
@SecurityRequirement(name = "bearerAuth")
public class CampaignChronicleController {

    private final CampaignChronicleService campaignChronicleService;

    @GetMapping
    @Operation(summary = "Listar crônicas da campanha", description = "Retorna o histórico de sessões ordenadas pelo número da sessão.")
    public ResponseEntity<List<CampaignChronicleDTO>> getChroniclesByCampaign(
            @PathVariable UUID campaignId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignChronicleService.getChroniclesByCampaign(campaignId, user));
    }

    @GetMapping("/{chronicleId}")
    @Operation(summary = "Obter crônica por ID", description = "Retorna os detalhes de uma crônica de sessão específica.")
    public ResponseEntity<CampaignChronicleDTO> getChronicleById(
            @PathVariable UUID campaignId,
            @PathVariable UUID chronicleId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignChronicleService.getChronicleById(campaignId, chronicleId, user));
    }

    @PostMapping
    @Operation(summary = "Criar crônica de sessão", description = "Registra uma nova crônica para uma sessão de jogo (somente Mestre).")
    public ResponseEntity<CampaignChronicleDTO> createChronicle(
            @PathVariable UUID campaignId,
            @Valid @RequestBody CampaignChronicleCreateDTO request,
            @AuthenticationPrincipal User user
    ) {
        CampaignChronicleDTO response = campaignChronicleService.createChronicle(campaignId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{chronicleId}")
    @Operation(summary = "Atualizar crônica de sessão", description = "Atualiza o resumo e narrativa de uma sessão existente (somente Mestre).")
    public ResponseEntity<CampaignChronicleDTO> updateChronicle(
            @PathVariable UUID campaignId,
            @PathVariable UUID chronicleId,
            @Valid @RequestBody CampaignChronicleCreateDTO request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignChronicleService.updateChronicle(campaignId, chronicleId, request, user));
    }

    @DeleteMapping("/{chronicleId}")
    @Operation(summary = "Excluir crônica de sessão", description = "Remove permanentemente o registro de uma crônica (somente Mestre).")
    public ResponseEntity<Void> deleteChronicle(
            @PathVariable UUID campaignId,
            @PathVariable UUID chronicleId,
            @AuthenticationPrincipal User user
    ) {
        campaignChronicleService.deleteChronicle(campaignId, chronicleId, user);
        return ResponseEntity.noContent().build();
    }
}
