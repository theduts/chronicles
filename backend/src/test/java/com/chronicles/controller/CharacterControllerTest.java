package com.chronicles.controller;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.Character;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.domain.jsonb.*;
import com.chronicles.dto.character.CharacterRequest;
import com.chronicles.repository.CampaignRepository;
import com.chronicles.repository.CharacterRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CharacterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CharacterRepository characterRepository;

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
        evolutionRequest.setRace("Anão");
        evolutionRequest.setClassKit("Guerreiro");
        mockMvc.perform(post("/api/characters/" + characterId + "/submit-review")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evolutionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPendingDMReview").value(true))
                .andExpect(jsonPath("$.pendingChanges").exists())
                .andExpect(jsonPath("$.pendingChanges.name").value("Sir Roderick O Bravo"))
                .andExpect(jsonPath("$.pendingChanges.race").value("Anão"))
                .andExpect(jsonPath("$.pendingChanges.classKit").value("Guerreiro"))
                .andExpect(jsonPath("$.pendingChanges.level").value(3));

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
    @DisplayName("GET /api/characters: DM should list characters from campaigns they DM")
    void shouldListCampaignCharactersForCampaignDm() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        User dm = userRepository.save(User.builder()
                .username("dm_list_" + unique)
                .email("dm_list_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        String dmAuth = "Bearer " + jwtService.generateToken(dm);

        User player = userRepository.save(User.builder()
                .username("player_list_" + unique)
                .email("player_list_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());

        Campaign campaign = campaignRepository.save(Campaign.builder()
                .dm(dm)
                .name("Campanha DM List")
                .inviteCode("DML" + unique.toUpperCase())
                .isActive(true)
                .build());

        Character playerChar = characterRepository.save(Character.builder()
                .user(player)
                .campaignId(campaign.getId())
                .name("Aragorn List")
                .race("Dúnedain")
                .classKit("Ranger")
                .currentLevel(3)
                .xp(3000)
                .isPendingReview(true)
                .sheet(CharacterSheet.builder().build())
                .build());

        // DM lists characters with role=dm: should contain player's character in the DM's campaign
        mockMvc.perform(get("/api/characters")
                        .param("role", "dm")
                        .header(HttpHeaders.AUTHORIZATION, dmAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(playerChar.getId().toString()))
                .andExpect(jsonPath("$[0].name").value("Aragorn List"))
                .andExpect(jsonPath("$[0].isPendingDMReview").value(true));

        // DM with role=player should NOT see other players' characters, only their own (0 in this case)
        mockMvc.perform(get("/api/characters")
                        .param("role", "player")
                        .header(HttpHeaders.AUTHORIZATION, dmAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // DM gets character by ID: should be allowed (status 200)
        mockMvc.perform(get("/api/characters/" + playerChar.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(playerChar.getId().toString()))
                .andExpect(jsonPath("$.name").value("Aragorn List"));
    }

    @Test
    @DisplayName("GET /api/characters without authentication should return 401 or 403")
    void shouldDenyUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/characters"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/characters/{id}/level-up: should allow campaign DM to level up character and persist in DB")
    void shouldAllowCampaignDmToLevelUpCharacter() throws Exception {
        // DM user
        User dm = userRepository.save(User.builder()
                .username("master_dm_" + UUID.randomUUID().toString().substring(0, 6))
                .email("master_" + UUID.randomUUID().toString().substring(0, 6) + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        String dmAuth = "Bearer " + jwtService.generateToken(dm);

        // Campaign owned by DM
        Campaign campaign = campaignRepository.save(Campaign.builder()
                .name("Tormenta Campaign")
                .dm(dm)
                .inviteCode("TRM-" + UUID.randomUUID().toString().substring(0, 6))
                .build());

        // Player character in campaign at level 1 with 10 XP (more than required 5 XP for level 2)
        Character playerChar = characterRepository.save(Character.builder()
                .user(testUser)
                .campaignId(campaign.getId())
                .name("Ey Yol2")
                .race("Humano")
                .classKit("Guerreiro")
                .currentLevel(1)
                .xp(10)
                .isPendingReview(true)
                .sheet(CharacterSheet.builder().level(1).xp(10).name("Ey Yol2").build())
                .build());

        // DM triggers level-up
        mockMvc.perform(post("/api/characters/" + playerChar.getId() + "/level-up")
                        .header(HttpHeaders.AUTHORIZATION, dmAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.level").value(2))
                .andExpect(jsonPath("$.xp").value(10))
                .andExpect(jsonPath("$.isPendingDMReview").value(false));

        // Verify DB state
        Character updatedInDb = characterRepository.findById(playerChar.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(2, updatedInDb.getCurrentLevel());
        org.junit.jupiter.api.Assertions.assertEquals(10, updatedInDb.getXp());
        org.junit.jupiter.api.Assertions.assertFalse(updatedInDb.getIsPendingReview());
        org.junit.jupiter.api.Assertions.assertNotNull(updatedInDb.getSheetLastLevel());
        org.junit.jupiter.api.Assertions.assertEquals(1, updatedInDb.getSheetLastLevel().getLevel());
    }

    @Test
    @DisplayName("POST /api/characters/{id}/level-up: should forbid player or non-campaign DM from leveling up")
    void shouldForbidNonCampaignDmFromLevelingUp() throws Exception {
        // DM user
        User dm = userRepository.save(User.builder()
                .username("master_dm2_" + UUID.randomUUID().toString().substring(0, 6))
                .email("master2_" + UUID.randomUUID().toString().substring(0, 6) + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());

        Campaign campaign = campaignRepository.save(Campaign.builder()
                .name("Other Campaign")
                .dm(dm)
                .inviteCode("OTH-" + UUID.randomUUID().toString().substring(0, 6))
                .build());

        Character playerChar = characterRepository.save(Character.builder()
                .user(testUser)
                .campaignId(campaign.getId())
                .name("Ey Yol2")
                .currentLevel(1)
                .xp(10)
                .sheet(CharacterSheet.builder().level(1).xp(10).build())
                .build());

        // Player (non-DM) attempts level-up -> Forbidden
        mockMvc.perform(post("/api/characters/" + playerChar.getId() + "/level-up")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/characters/{id}/level-up: should reject if character not in campaign or already max level")
    void shouldRejectWhenNoCampaignOrMaxLevel() throws Exception {
        // DM user
        User dm = userRepository.save(User.builder()
                .username("master_dm3_" + UUID.randomUUID().toString().substring(0, 6))
                .email("master3_" + UUID.randomUUID().toString().substring(0, 6) + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        String dmAuth = "Bearer " + jwtService.generateToken(dm);

        // Character without campaign
        Character noCampChar = characterRepository.save(Character.builder()
                .user(testUser)
                .name("No Campaign Char")
                .currentLevel(1)
                .xp(10)
                .sheet(CharacterSheet.builder().level(1).xp(10).build())
                .build());

        mockMvc.perform(post("/api/characters/" + noCampChar.getId() + "/level-up")
                        .header(HttpHeaders.AUTHORIZATION, dmAuth))
                .andExpect(status().isBadRequest());

        // Character at max level 15 in campaign
        Campaign campaign = campaignRepository.save(Campaign.builder()
                .name("Max Campaign")
                .dm(dm)
                .inviteCode("MAX-" + UUID.randomUUID().toString().substring(0, 6))
                .build());

        Character maxChar = characterRepository.save(Character.builder()
                .user(testUser)
                .campaignId(campaign.getId())
                .name("Max Level Hero")
                .currentLevel(15)
                .xp(2500)
                .sheet(CharacterSheet.builder().level(15).xp(2500).build())
                .build());

        mockMvc.perform(post("/api/characters/" + maxChar.getId() + "/level-up")
                        .header(HttpHeaders.AUTHORIZATION, dmAuth))
                .andExpect(status().isBadRequest());
    }
}

