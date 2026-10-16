package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.auth.LastCampaignRequest;
import com.chronicles.dto.auth.UserSessionResponse;
import com.chronicles.dto.auth.ViewModeRequest;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.chronicles.repository.UserRepository;
import com.chronicles.service.ReviewTicketService;
import com.chronicles.service.ViewModeRateLimitService;
import com.chronicles.dto.review.ReviewTicketResponse;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "Endpoints para gerenciamento de perfil e preferências")
public class UserController {

    private final UserRepository userRepository;
    private final ViewModeRateLimitService viewModeRateLimitService;
    private final CampaignRepository campaignRepository;
    private final CampaignPlayerRepository campaignPlayerRepository;
    private final ReviewTicketService reviewTicketService;

    @GetMapping("/me")
    @Operation(summary = "Sessão do usuário", description = "Retorna o perfil, o último modo de visualização e as últimas campanhas (Mestre/Jogador) do usuário logado")
    public ResponseEntity<UserSessionResponse> getMe(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(UserSessionResponse.of(currentUser));
    }

    @GetMapping("/me/review-tickets")
    @Operation(summary = "Meus pedidos de análise", description = "Retorna o histórico de pedidos de análise de ficha do usuário logado")
    public ResponseEntity<List<ReviewTicketResponse>> getMyReviewTickets(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(reviewTicketService.getTicketsForPlayer(currentUser));
    }

    @PatchMapping("/me/view-mode")
    @Operation(summary = "Atualizar modo de visualização", description = "Atualiza o modo de visualização ativo do usuário logado (PLAYER ou DM)")
    public ResponseEntity<Void> updateViewMode(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ViewModeRequest request) {
        
        log.info("[UserController] User '{}' solicitando atualização de view-mode para '{}'", 
                currentUser.getUsername(), request.mode());

        viewModeRateLimitService.checkAndRecord(currentUser.getId().toString());

        currentUser.setLastViewMode(request.mode());
        userRepository.save(currentUser);

        log.info("[UserController] View-mode atualizado com sucesso para '{}' (usuário '{}')", 
                request.mode(), currentUser.getUsername());

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/last-campaign")
    @Operation(summary = "Atualizar última campanha", description = "Salva a última campanha ativa do usuário para o modo informado (PLAYER ou DM). campaignId nulo limpa o valor.")
    public ResponseEntity<Void> updateLastCampaign(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody LastCampaignRequest request) {

        boolean dmMode = "DM".equals(request.mode());
        if (request.campaignId() != null) {
            boolean allowed = dmMode
                    ? campaignRepository.existsByIdAndDmId(request.campaignId(), currentUser.getId())
                    : campaignPlayerRepository.existsByCampaignIdAndUserId(request.campaignId(), currentUser.getId());
            if (!allowed) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta campanha neste modo.");
            }
        }

        if (dmMode) {
            currentUser.setLastCampaignDmSession(request.campaignId());
        } else {
            currentUser.setLastCampaignPlayerSession(request.campaignId());
        }
        userRepository.save(currentUser);

        return ResponseEntity.noContent().build();
    }
}
