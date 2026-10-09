package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.campaign.AddPlayerRequest;
import com.chronicles.dto.campaign.CampaignRequest;
import com.chronicles.dto.campaign.CampaignResponse;
import com.chronicles.dto.character.CharacterRequest;
import com.chronicles.dto.character.CharacterResponse;
import com.chronicles.service.CampaignService;
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
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
@Tag(name = "Campaigns", description = "Endpoints para gerenciamento de campanhas e aprovação de fichas pelo Mestre")
@SecurityRequirement(name = "bearerAuth")
public class CampaignController {

    private final CampaignService campaignService;
    private final CharacterService characterService;

    @GetMapping
    @Operation(summary = "Listar campanhas", description = "Retorna todas as campanhas em que o usuário atua como Mestre ou Jogador, permitindo filtrar por papel ('dm' ou 'player').")
    public ResponseEntity<List<CampaignResponse>> getMyCampaigns(
            @RequestParam(required = false) String role,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignService.getCampaignsForUser(user, role));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter campanha por ID", description = "Retorna os detalhes de uma campanha específica.")
    public ResponseEntity<CampaignResponse> getCampaignById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignService.getCampaignById(id, user));
    }

    @PostMapping
    @Operation(summary = "Criar campanha", description = "Cria uma nova campanha onde o usuário autenticado será o Mestre (DM).")
    public ResponseEntity<CampaignResponse> createCampaign(
            @Valid @RequestBody CampaignRequest request,
            @AuthenticationPrincipal User user
    ) {
        CampaignResponse response = campaignService.createCampaign(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar campanha", description = "Atualiza os dados de uma campanha existente (somente Mestre).")
    public ResponseEntity<CampaignResponse> updateCampaign(
            @PathVariable UUID id,
            @Valid @RequestBody CampaignRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request, user));
    }

    @PatchMapping("/{id}/lore")
    @Operation(summary = "Atualizar história (lore) da campanha", description = "Atualiza o texto da lore da campanha (somente Mestre).")
    public ResponseEntity<CampaignResponse> updateCampaignLore(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal User user
    ) {
        String lore = body != null ? body.get("lore") : null;
        return ResponseEntity.ok(campaignService.updateCampaignLore(id, lore, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir campanha", description = "Exclui uma campanha existente (somente Mestre).")
    public ResponseEntity<Void> deleteCampaign(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        campaignService.deleteCampaign(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/players")
    @Operation(summary = "Adicionar ou ingressar jogador na campanha", description = "Adiciona jogador por convite direto do Mestre ou via código de convite.")
    public ResponseEntity<CampaignResponse> addPlayer(
            @PathVariable UUID id,
            @RequestBody AddPlayerRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignService.addPlayer(id, request, user));
    }

    @PostMapping("/join")
    @Operation(summary = "Ingressar em campanha via código", description = "Permite que um jogador ingresse em uma campanha usando apenas o código de convite.")
    public ResponseEntity<CampaignResponse> joinCampaign(
            @RequestBody AddPlayerRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignService.joinByInviteCode(request.getInviteCode(), user));
    }


    @PostMapping("/{id}/approve-character/{characterId}")
    @Operation(summary = "Aprovar evolução de ficha pelo Mestre", description = "Aprova as alterações pendentes de uma ficha, consolidando o novo nível e criando snapshot de rollback.")
    public ResponseEntity<CharacterResponse> approveCharacter(
            @PathVariable UUID id,
            @PathVariable UUID characterId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignService.approveCharacter(id, characterId, user));
    }

    @PostMapping("/{id}/reject-character/{characterId}")
    @Operation(summary = "Rejeitar evolução de ficha pelo Mestre", description = "Rejeita as alterações propostas de uma ficha, descartando-as.")
    public ResponseEntity<CharacterResponse> rejectCharacter(
            @PathVariable UUID id,
            @PathVariable UUID characterId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(campaignService.rejectCharacter(id, characterId, user));
    }

    @PostMapping("/{id}/characters/{characterId}/level-up")
    @Operation(summary = "Evoluir nível do personagem pelo Mestre da campanha", description = "Permite que o Mestre da campanha aprove/execute a evolução de nível de um personagem da campanha.")
    public ResponseEntity<CharacterResponse> levelUpCharacter(
            @PathVariable UUID id,
            @PathVariable UUID characterId,
            @RequestBody(required = false) CharacterRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(characterService.levelUpCharacter(characterId, request, user));
    }
}
