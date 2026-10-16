package com.chronicles.controller;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.Character;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.domain.jsonb.AttributeRow;
import com.chronicles.domain.jsonb.CharacterAttributes;
import com.chronicles.domain.jsonb.CharacterSheet;
import com.chronicles.dto.campaign.CampaignRequest;
import com.chronicles.dto.character.CharacterRequest;
import com.chronicles.dto.review.ReviewDecisionRequest;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReviewTicketControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private CharacterRepository characterRepository;
    @Autowired private JwtService jwtService;

    private User dmUser;
    private String dmToken;
    private User playerUser;
    private String playerToken;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        dmUser = userRepository.save(User.builder()
                .username("dm_" + unique).email("dm_" + unique + "@chronicles.com")
                .passwordHash("hashed").role(Role.ROLE_USER).isActive(true).build());
        dmToken = "Bearer " + jwtService.generateToken(dmUser);

        playerUser = userRepository.save(User.builder()
                .username("pl_" + unique).email("pl_" + unique + "@chronicles.com")
                .passwordHash("hashed").role(Role.ROLE_USER).isActive(true).build());
        playerToken = "Bearer " + jwtService.generateToken(playerUser);
    }

    private String createCampaign() throws Exception {
        CampaignRequest req = CampaignRequest.builder().name("Arton").subtitulo("s").universo("u").build();
        String body = mockMvc.perform(post("/api/campaigns")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asText();
    }

    private CharacterSheet sheetWithForce(int value) {
        return CharacterSheet.builder()
                .attributes(CharacterAttributes.builder()
                        .forAttr(AttributeRow.builder().natural(value).build())
                        .build())
                .build();
    }

    @Test
    @DisplayName("Review tickets: submit creates PENDING ticket, DM approval closes it with feedback")
    void shouldCreateAndApproveTicket() throws Exception {
        String campaignId = createCampaign();
        Character character = characterRepository.save(Character.builder()
                .user(playerUser).campaignId(UUID.fromString(campaignId)).name("Kaelen")
                .currentLevel(1).xp(0).sheet(sheetWithForce(12)).build());

        CharacterRequest submit = CharacterRequest.builder()
                .name("Kaelen").campaignId(UUID.fromString(campaignId))
                .attributes(CharacterAttributes.builder()
                        .forAttr(AttributeRow.builder().natural(14).build()).build())
                .build();

        mockMvc.perform(post("/api/characters/" + character.getId() + "/submit-review")
                        .header(HttpHeaders.AUTHORIZATION, playerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submit)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/me/review-tickets").header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].characterName").value("Kaelen"))
                .andExpect(jsonPath("$[0].changes.attributes.for.natural.last").value(12))
                .andExpect(jsonPath("$[0].changes.attributes.for.natural.new").value(14));

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/approve-character/" + character.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ReviewDecisionRequest("Bom trabalho"))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/campaigns/" + campaignId + "/review-tickets").header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("APPROVED"))
                .andExpect(jsonPath("$[0].dmFeedback").value("Bom trabalho"))
                .andExpect(jsonPath("$[0].reviewerId").value(dmUser.getId().toString()))
                .andExpect(jsonPath("$[0].reviewedAt").exists())
                .andExpect(jsonPath("$[0].playerName").value(playerUser.getUsername()));
    }

    @Test
    @DisplayName("Review tickets: rejection without body still works; resubmission reuses pending ticket")
    void shouldRejectWithoutBodyAndNotDuplicatePending() throws Exception {
        String campaignId = createCampaign();
        Character character = characterRepository.save(Character.builder()
                .user(playerUser).campaignId(UUID.fromString(campaignId)).name("Kaelen")
                .currentLevel(1).xp(0).sheet(sheetWithForce(12)).build());

        for (int value : new int[]{14, 15}) {
            CharacterRequest submit = CharacterRequest.builder()
                    .name("Kaelen").campaignId(UUID.fromString(campaignId))
                    .attributes(CharacterAttributes.builder()
                            .forAttr(AttributeRow.builder().natural(value).build()).build())
                    .build();
            mockMvc.perform(post("/api/characters/" + character.getId() + "/submit-review")
                            .header(HttpHeaders.AUTHORIZATION, playerToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(submit)))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/users/me/review-tickets").header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].changes.attributes.for.natural.new").value(15));

        mockMvc.perform(post("/api/campaigns/" + campaignId + "/reject-character/" + character.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/me/review-tickets").header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(jsonPath("$[0].status").value("REJECTED"));
    }

    @Test
    @DisplayName("Review tickets: only the campaign DM can list campaign tickets")
    void shouldForbidNonDmFromCampaignTickets() throws Exception {
        String campaignId = createCampaign();
        mockMvc.perform(get("/api/campaigns/" + campaignId + "/review-tickets")
                        .header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(status().isForbidden());
    }
}
