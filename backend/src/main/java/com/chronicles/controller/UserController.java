package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.auth.ViewModeRequest;
import com.chronicles.repository.UserRepository;
import com.chronicles.service.ViewModeRateLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints para gerenciamento de perfil e preferências")
public class UserController {

    private final UserRepository userRepository;
    private final ViewModeRateLimitService viewModeRateLimitService;

    @PatchMapping("/me/view-mode")
    @Operation(summary = "Atualizar modo de visualização", description = "Atualiza o modo de visualização ativo do usuário logado (PLAYER ou DM)")
    public ResponseEntity<Void> updateViewMode(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ViewModeRequest request) {
        
        viewModeRateLimitService.checkAndRecord(currentUser.getId().toString());

        currentUser.setLastViewMode(request.mode());
        userRepository.save(currentUser);

        return ResponseEntity.noContent().build();
    }
}
