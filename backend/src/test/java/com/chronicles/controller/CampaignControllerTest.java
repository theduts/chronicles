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

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
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
    }
}
