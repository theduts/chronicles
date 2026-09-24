package com.chronicles.service;

import com.chronicles.domain.Note;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.note.NoteRequest;
import com.chronicles.dto.note.NoteResponse;
import com.chronicles.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy - HH:mm")
            .withZone(ZoneId.systemDefault());

    @Transactional(readOnly = true)
    public List<NoteResponse> getNotes(User user, UUID campaignId) {
        List<Note> notes;
        if (campaignId != null) {
            notes = noteRepository.findAllByCampaignIdOrderByCreatedAtDesc(campaignId);
        } else {
            notes = noteRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
        }

        return notes.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(UUID id, User user) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anotação não encontrada"));

        if (!note.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso não autorizado a esta anotação");
        }

        return toResponse(note);
    }

    @Transactional
    public NoteResponse createNote(NoteRequest request, User user) {
        Note note = Note.builder()
                .user(user)
                .campaignId(request.getCampaignId())
                .title(request.getTitle().trim())
                .content(request.getContent())
                .build();

        Note saved = noteRepository.save(note);
        return toResponse(saved);
    }

    @Transactional
    public NoteResponse updateNote(UUID id, NoteRequest request, User user) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anotação não encontrada"));

        if (!note.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o autor pode editar a anotação");
        }

        note.setTitle(request.getTitle().trim());
        note.setContent(request.getContent());
        if (request.getCampaignId() != null) {
            note.setCampaignId(request.getCampaignId());
        }

        Note saved = noteRepository.save(note);
        return toResponse(saved);
    }

    @Transactional
    public void deleteNote(UUID id, User user) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anotação não encontrada"));

        if (!note.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o autor pode excluir a anotação");
        }

        noteRepository.delete(note);
    }

    private NoteResponse toResponse(Note note) {
        String meta = note.getCreatedAt() != null ? FORMATTER.format(note.getCreatedAt()) : "";

        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .meta(meta)
                .campaignId(note.getCampaignId())
                .userId(note.getUser().getId())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
