package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.spell.SpellRequest;
import com.chronicles.dto.spell.SpellResponse;
import com.chronicles.service.SpellService;
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
@RequestMapping("/api/spells")
@RequiredArgsConstructor
@Tag(name = "Spells", description = "Endpoints para consulta do catálogo de magias e grimório")
@SecurityRequirement(name = "bearerAuth")
public class SpellController {

    private final SpellService spellService;

    @GetMapping
    @Operation(summary = "Listar magias do grimório", description = "Retorna magias cadastradas com filtros opcionais por slug do sistema e foco/escola arcana.")
    public ResponseEntity<List<SpellResponse>> getSpells(
            @RequestParam(required = false, defaultValue = "daemon") String systemSlug,
            @RequestParam(required = false) String schoolOrFocus
    ) {
        return ResponseEntity.ok(spellService.getSpells(systemSlug, schoolOrFocus));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter magia por ID", description = "Retorna detalhes e custo de uma magia.")
    public ResponseEntity<SpellResponse> getSpellById(@PathVariable UUID id) {
        return ResponseEntity.ok(spellService.getSpellById(id));
    }

    @PostMapping
    @Operation(summary = "Adicionar nova magia ao grimório", description = "Cadastra uma nova magia.")
    public ResponseEntity<SpellResponse> createSpell(
            @Valid @RequestBody SpellRequest request,
            @AuthenticationPrincipal User user
    ) {
        SpellResponse response = spellService.createSpell(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
