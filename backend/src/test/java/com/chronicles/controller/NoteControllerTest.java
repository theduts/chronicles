package com.chronicles.controller;

import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.note.NoteRequest;
import com.chronicles.repository.UserRepository;
import com.chronicles.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class NoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        testUser = userRepository.save(User.builder()
                .username("note_user_" + unique)
                .email("note_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        jwtToken = "Bearer " + jwtService.generateToken(testUser);
    }

    @Test
    @DisplayName("Notes CRUD: should create, list, update and delete notes")
    void shouldExecuteNotesCrud() throws Exception {
        NoteRequest request = NoteRequest.builder()
                .title("Pistas sobre o Culto de Tenebra")
                .content("O líder encapuzado mencionou um artefato nas catacumbas.")
                .build();

        // 1. Create note
        MvcResult createResult = mockMvc.perform(post("/api/notes")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Pistas sobre o Culto de Tenebra"))
                .andExpect(jsonPath("$.content").value("O líder encapuzado mencionou um artefato nas catacumbas."))
                .andExpect(jsonPath("$.meta").exists())
                .andReturn();

        String noteId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        // 2. List notes
        mockMvc.perform(get("/api/notes")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(noteId));

        // 3. Update note
        request.setTitle("Pistas sobre o Culto de Tenebra (Atualizado)");
        request.setContent("Encontramos o mapa das catacumbas.");

        mockMvc.perform(put("/api/notes/" + noteId)
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Pistas sobre o Culto de Tenebra (Atualizado)"));

        // 4. Delete note
        mockMvc.perform(delete("/api/notes/" + noteId)
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isNoContent());

        // 5. Verify deletion
        mockMvc.perform(get("/api/notes/" + noteId)
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isNotFound());
    }
}
