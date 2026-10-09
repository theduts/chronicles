package com.chronicles.controller;

import com.chronicles.domain.Character;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.domain.jsonb.AttributeRow;
import com.chronicles.domain.jsonb.CharacterAttributes;
import com.chronicles.domain.jsonb.CharacterSheet;
import com.chronicles.dto.campaign.AddPlayerRequest;
import com.chronicles.dto.campaign.CampaignRequest;
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

import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CampaignControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private JwtService jwtService;

    private User dmUser;
    private String dmToken;

    private User playerUser;
    private String playerToken;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        dmUser = userRepository.save(User.builder()
                .username("dm_" + unique)
                .email("dm_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        dmToken = "Bearer " + jwtService.generateToken(dmUser);

        playerUser = userRepository.save(User.builder()
                .username("player_" + unique)
                .email("player_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        playerToken = "Bearer " + jwtService.generateToken(playerUser);
    }

    @Test
    @DisplayName("Campaign & DM Review: should create campaign, join via invite code, and approve character evolution")
    void shouldExecuteFullCampaignAndDMReviewWorkflow() throws Exception {
        // 1. DM creates campaign
        CampaignRequest campaignRequest = CampaignRequest.builder()
                .name("Crônicas de Arton")
                .subtitulo("A Vingança dos Deuses")
                .universo("Medieval / Tormenta")
                .currentAct("Ato I")
                .lore("Em tempos remotos...")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/campaigns")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(campaignRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Crônicas de Arton"))
                .andExpect(jsonPath("$.inviteCode").exists())
                .andExpect(jsonPath("$.isDm").value(true))
                .andReturn();

        String campaignId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();
        String inviteCode = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("inviteCode").asText();

        // 2. Player joins campaign via invite code
        AddPlayerRequest joinRequest = AddPlayerRequest.builder()
                .inviteCode(inviteCode)
                .build();

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/players")
                        .header(HttpHeaders.AUTHORIZATION, playerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(joinRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.players", hasSize(1)));

        // 3. Player creates a character in the campaign with pending review
        CharacterSheet baseSheet = CharacterSheet.builder()
                .attributes(CharacterAttributes.builder()
                        .con(AttributeRow.builder().natural(12).build())
                        .forAttr(AttributeRow.builder().natural(14).build())
                        .build())
                .build();

        CharacterSheet proposedSheet = CharacterSheet.builder()
                .attributes(CharacterAttributes.builder()
                        .con(AttributeRow.builder().natural(13).build())
                        .forAttr(AttributeRow.builder().natural(16).build())
                        .build())
                .build();

        Character character = characterRepository.save(Character.builder()
                .user(playerUser)
                .campaignId(UUID.fromString(campaignId))
                .name("Kaelen")
                .currentLevel(1)
                .xp(1000)
                .isPendingReview(true)
                .sheet(baseSheet)
                .proposedSheet(proposedSheet)
                .build());

        // 4. DM approves the character's proposed evolution
        mockMvc.perform(post("/api/campaigns/" + campaignId + "/approve-character/" + character.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPendingDMReview").value(false))
                .andExpect(jsonPath("$.attributes.for.natural").value(16))
                .andExpect(jsonPath("$.attributes.con.natural").value(13));

        // 5. Submit another proposed change and test rejection
        character = characterRepository.findById(character.getId()).orElseThrow();
        character.setIsPendingReview(true);
        character.setProposedSheet(CharacterSheet.builder()
                .attributes(CharacterAttributes.builder()
                        .con(AttributeRow.builder().natural(18).build())
                        .build())
                .build());
        characterRepository.save(character);

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/reject-character/" + character.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPendingDMReview").value(false))
                .andExpect(jsonPath("$.attributes.con.natural").value(13));

        // 6. Verify DM CANNOT approve their own character
        Character dmOwnChar = characterRepository.save(Character.builder()
                .user(dmUser)
                .campaignId(UUID.fromString(campaignId))
                .name("DM Self Char")
                .currentLevel(1)
                .xp(1000)
                .isPendingReview(true)
                .sheet(baseSheet)
                .proposedSheet(proposedSheet)
                .build());

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/approve-character/" + dmOwnChar.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isForbidden());

        // 7. DM levels up player character via campaign endpoint
        mockMvc.perform(post("/api/campaigns/" + campaignId + "/characters/" + character.getId() + "/level-up")
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.level").value(2));
    }

    @Test
    @DisplayName("Campaign membership: should invite player by email and join campaign via code endpoint")
    void shouldInvitePlayerByEmailAndJoinByCode() throws Exception {
        // 1. DM creates campaign
        CampaignRequest createRequest = CampaignRequest.builder()
                .name("Guerra Táurica")
                .subtitulo("A marcha do general")
                .universo("Medieval")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/campaigns")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String campaignId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();
        String inviteCode = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("inviteCode").asText();

        // 2. DM invites player by email
        AddPlayerRequest emailInvite = AddPlayerRequest.builder()
                .email(playerUser.getEmail())
                .build();

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/players")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailInvite)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.players", hasItem(playerUser.getEmail())));

        // 3. Create another player and test joining via /api/campaigns/join with inviteCode
        String unique = UUID.randomUUID().toString().substring(0, 8);
        User player2 = userRepository.save(User.builder()
                .username("player2_" + unique)
                .email("player2_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());
        String player2Token = "Bearer " + jwtService.generateToken(player2);

        AddPlayerRequest joinRequest = AddPlayerRequest.builder()
                .inviteCode(inviteCode)
                .build();

        mockMvc.perform(post("/api/campaigns/join")
                        .header(HttpHeaders.AUTHORIZATION, player2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(joinRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(campaignId))
                .andExpect(jsonPath("$.players", hasItem(player2.getEmail())));

        // 4. Test joining with invalid code
        AddPlayerRequest invalidRequest = AddPlayerRequest.builder()
                .inviteCode("INVALID99")
                .build();

        mockMvc.perform(post("/api/campaigns/join")
                        .header(HttpHeaders.AUTHORIZATION, player2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Campaign filtering by role: should separate master campaigns from player campaigns")
    void shouldFilterCampaignsByRole() throws Exception {
        // 1. dmUser creates Campaign A (where dmUser is DM)
        CampaignRequest campARequest = CampaignRequest.builder()
                .name("Campanha do Mestre A")
                .subtitulo("Mestrada por dmUser")
                .universo("Medieval")
                .build();

        MvcResult campAResult = mockMvc.perform(post("/api/campaigns")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(campARequest)))
                .andExpect(status().isCreated())
                .andReturn();
        String campAId = objectMapper.readTree(campAResult.getResponse().getContentAsString()).get("id").asText();

        // 2. playerUser creates Campaign B (where playerUser is DM)
        CampaignRequest campBRequest = CampaignRequest.builder()
                .name("Campanha do Mestre B")
                .subtitulo("Mestrada por playerUser")
                .universo("Cyberpunk")
                .build();

        MvcResult campBResult = mockMvc.perform(post("/api/campaigns")
                        .header(HttpHeaders.AUTHORIZATION, playerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(campBRequest)))
                .andExpect(status().isCreated())
                .andReturn();
        String campBId = objectMapper.readTree(campBResult.getResponse().getContentAsString()).get("id").asText();
        String campBCode = objectMapper.readTree(campBResult.getResponse().getContentAsString()).get("inviteCode").asText();

        // 3. dmUser joins Campaign B as a Player
        AddPlayerRequest joinRequest = AddPlayerRequest.builder()
                .inviteCode(campBCode)
                .build();

        mockMvc.perform(post("/api/campaigns/join")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(joinRequest)))
                .andExpect(status().isOk());

        // 4. dmUser queries with role=dm: must only see Campanha A, NOT Campanha B
        mockMvc.perform(get("/api/campaigns")
                        .param("role", "dm")
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(campAId));

        // 5. dmUser queries with role=player: must only see Campanha B, NOT Campanha A
        mockMvc.perform(get("/api/campaigns")
                        .param("role", "player")
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(campBId));

        // 6. dmUser queries without role: sees both campaigns
        mockMvc.perform(get("/api/campaigns")
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("PATCH /api/campaigns/{id}/lore deve atualizar a história da campanha com sucesso pelo DM")
    void shouldUpdateCampaignLoreSuccessfully() throws Exception {
        CampaignRequest createRequest = CampaignRequest.builder()
                .name("Campanha Lore Teste")
                .subtitulo("Subtítulo")
                .universo("Medieval")
                .lore("História inicial")
                .ilustracao("https://images.example.com/banner.jpg")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/campaigns")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lore").value("História inicial"))
                .andExpect(jsonPath("$.illustrationUrl").value("https://images.example.com/banner.jpg"))
                .andReturn();

        String campaignId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        java.util.Map<String, String> patchBody = java.util.Map.of("lore", "História atualizada e épica dos reinos ancestrais.");

        mockMvc.perform(patch("/api/campaigns/" + campaignId + "/lore")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(campaignId))
                .andExpect(jsonPath("$.lore").value("História atualizada e épica dos reinos ancestrais."))
                .andExpect(jsonPath("$.illustrationUrl").value("https://images.example.com/banner.jpg"));

        // Player cannot patch lore
        mockMvc.perform(patch("/api/campaigns/" + campaignId + "/lore")
                        .header(HttpHeaders.AUTHORIZATION, playerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchBody)))
                .andExpect(status().isForbidden());
    }
}

