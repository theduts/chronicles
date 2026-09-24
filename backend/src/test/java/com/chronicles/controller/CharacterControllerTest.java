package com.chronicles.controller;

import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.domain.jsonb.*;
import com.chronicles.dto.character.CharacterRequest;
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

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CharacterControllerTest {

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
                .username("hero_" + unique)
                .email("hero_" + unique + "@chronicles.com")
                .passwordHash("hashed_secret")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());

        jwtToken = "Bearer " + jwtService.generateToken(testUser);
    }

    private CharacterRequest createSampleRequest(String name) {
        CharacterAttributes attributes = CharacterAttributes.builder()
                .con(AttributeRow.builder().natural(14).pctNatural("40%").valorAmpliado(14).build())
                .forAttr(AttributeRow.builder().natural(16).pctNatural("45%").valorAmpliado(16).build())
                .des(AttributeRow.builder().natural(12).pctNatural("35%").valorAmpliado(12).build())
                .agi(AttributeRow.builder().natural(15).pctNatural("40%").valorAmpliado(15).build())
                .intAttr(AttributeRow.builder().natural(10).pctNatural("30%").valorAmpliado(10).build())
                .per(AttributeRow.builder().natural(13).pctNatural("35%").valorAmpliado(13).build())
                .will(AttributeRow.builder().natural(11).pctNatural("30%").valorAmpliado(11).build())
                .car(AttributeRow.builder().natural(10).pctNatural("30%").valorAmpliado(10).build())
                .build();

        SkillRow swordSkill = SkillRow.builder()
                .group("Armas Brancas")
                .parentSkillName("Espada Longa")
                .atributo(16)
                .gasto(20)
                .total("55%")
                .atkGasto(10)
                .defGasto(10)
                .build();

        return CharacterRequest.builder()
                .name(name)
                .race("Humano")
                .classKit("Guerreiro")
                .level(1)
                .xp(0)
                .attributes(attributes)
                .skills(List.of(swordSkill))
                .treasure(Treasure.builder().ouro(15).prata(5).bronze(0).build())
                .build();
    }

    @Test
    @DisplayName("CRUD: should create, read, update, submit-review and delete character")
    void shouldExecuteFullCharacterLifecycle() throws Exception {
        CharacterRequest request = createSampleRequest("Sir Roderick");

        // 1. Create character
        MvcResult createResult = mockMvc.perform(post("/api/characters")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Sir Roderick"))
                .andExpect(jsonPath("$.race").value("Humano"))
                .andExpect(jsonPath("$.attributes.for.natural").value(16))
                .andExpect(jsonPath("$.skills[0].parentSkillName").value("Espada Longa"))
                .andExpect(jsonPath("$.isPendingDMReview").value(false))
                .andReturn();

        String characterId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

        // 2. List characters for user
        mockMvc.perform(get("/api/characters")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(characterId));

        // 3. Get character by ID
        mockMvc.perform(get("/api/characters/" + characterId)
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(characterId))
                .andExpect(jsonPath("$.name").value("Sir Roderick"));

        // 4. Update character
        request.setName("Sir Roderick O Bravo");
        request.setLevel(2);
        request.setXp(1200);

        mockMvc.perform(put("/api/characters/" + characterId)
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Sir Roderick O Bravo"))
                .andExpect(jsonPath("$.level").value(2))
                .andExpect(jsonPath("$.xp").value(1200));

        // 5. Submit for DM review
        CharacterRequest evolutionRequest = createSampleRequest("Sir Roderick O Bravo");
        evolutionRequest.setLevel(3);
        mockMvc.perform(post("/api/characters/" + characterId + "/submit-review")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evolutionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPendingDMReview").value(true))
                .andExpect(jsonPath("$.pendingChanges").exists());

        // 6. Delete character
        mockMvc.perform(delete("/api/characters/" + characterId)
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isNoContent());

        // 7. Verify deletion
        mockMvc.perform(get("/api/characters/" + characterId)
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/characters without authentication should return 401 or 403")
    void shouldDenyUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/characters"))
                .andExpect(status().isForbidden());
    }
}
