package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.auth.ViewModeRequest;
import com.chronicles.repository.UserRepository;
import com.chronicles.service.ViewModeRateLimitService;
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
}
