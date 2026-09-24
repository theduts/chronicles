package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.note.NoteRequest;
import com.chronicles.dto.note.NoteResponse;
import com.chronicles.service.NoteService;
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
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Endpoints para anotações pessoais e diários de campanhas")
@SecurityRequirement(name = "bearerAuth")
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    @Operation(summary = "Listar anotações", description = "Retorna anotações do usuário ou filtradas por campanha.")
    public ResponseEntity<List<NoteResponse>> getNotes(
            @RequestParam(required = false) UUID campaignId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(noteService.getNotes(user, campaignId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter anotação por ID", description = "Retorna os detalhes de uma anotação.")
    public ResponseEntity<NoteResponse> getNoteById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(noteService.getNoteById(id, user));
    }

    @PostMapping
    @Operation(summary = "Criar nova anotação", description = "Cria uma anotação pessoal ou vinculada a uma campanha.")
    public ResponseEntity<NoteResponse> createNote(
            @Valid @RequestBody NoteRequest request,
            @AuthenticationPrincipal User user
    ) {
        NoteResponse response = noteService.createNote(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar anotação", description = "Atualiza título e conteúdo de uma anotação existente.")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(noteService.updateNote(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir anotação", description = "Remove permanentemente a anotação.")
    public ResponseEntity<Void> deleteNote(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        noteService.deleteNote(id, user);
        return ResponseEntity.noContent().build();
    }
}
