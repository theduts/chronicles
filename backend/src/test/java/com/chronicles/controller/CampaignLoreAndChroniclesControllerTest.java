package com.chronicles.controller;

import com.chronicles.domain.*;
import com.chronicles.dto.CampaignChronicleCreateDTO;
import com.chronicles.dto.CampaignLoreCreateDTO;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
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

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CampaignLoreAndChroniclesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CampaignPlayerRepository campaignPlayerRepository;

    @Autowired
    private JwtService jwtService;

    private User dmUser;
    private User playerUser;
    private String dmToken;
    private String playerToken;
    private Campaign campaign;

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

        playerUser = userRepository.save(User.builder()
                .username("player_" + unique)
                .email("player_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_USER)
                .isActive(true)
                .build());

        dmToken = "Bearer " + jwtService.generateToken(dmUser);
        playerToken = "Bearer " + jwtService.generateToken(playerUser);

        campaign = campaignRepository.save(Campaign.builder()
                .dm(dmUser)
                .name("Guerra Artoniana " + unique)
                .inviteCode("WAR" + unique.toUpperCase())
                .isActive(true)
                .build());

        campaignPlayerRepository.save(CampaignPlayer.builder()
                .id(new CampaignPlayerId(campaign.getId(), playerUser.getId()))
                .campaign(campaign)
                .user(playerUser)
                .build());
    }

    @Test
    @DisplayName("Lore CRUD: DM creates and manages lore, player sees only visible items")
    void shouldExecuteLoreLifecycle() throws Exception {
        CampaignLoreCreateDTO visibleDto = CampaignLoreCreateDTO.builder()
                .category("deidade")
                .title("Valkaria")
                .description("Deusa da Humanidade e Ambição")
                .isVisible(true)
                .data(Map.of("crencas", "Liberdade acima de tudo"))
                .build();

        CampaignLoreCreateDTO hiddenDto = CampaignLoreCreateDTO.builder()
                .category("faccao")
                .title("Culto Secreto de Sszzaas")
                .description("Intrigas nas sombras")
                .isVisible(false)
                .data(Map.of("lider", "Desconhecido"))
                .build();

        // 1. DM creates visible lore
        MvcResult visibleResult = mockMvc.perform(post("/api/campaigns/" + campaign.getId() + "/lore")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(visibleDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Valkaria"))
                .andExpect(jsonPath("$.data.crencas").value("Liberdade acima de tudo"))
                .andReturn();

        String visibleId = objectMapper.readTree(visibleResult.getResponse().getContentAsString()).get("id").asText();

        // 2. DM creates hidden lore
        mockMvc.perform(post("/api/campaigns/" + campaign.getId() + "/lore")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hiddenDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isVisible").value(false));

        // 3. DM lists lore -> sees both (2 items)
        mockMvc.perform(get("/api/campaigns/" + campaign.getId() + "/lore")
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        // 4. Player lists lore -> sees only 1 (visible)
        mockMvc.perform(get("/api/campaigns/" + campaign.getId() + "/lore")
                        .header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Valkaria"));

        // 5. DM toggles visibility
        mockMvc.perform(patch("/api/campaigns/" + campaign.getId() + "/lore/" + visibleId + "/visibility")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .param("isVisible", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isVisible").value(false));

        // 6. Player now sees 0 visible items
        mockMvc.perform(get("/api/campaigns/" + campaign.getId() + "/lore")
                        .header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 7. DM deletes lore
        mockMvc.perform(delete("/api/campaigns/" + campaign.getId() + "/lore/" + visibleId)
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Chronicles CRUD: DM creates and manages chronicles, lists ordered by sessionNumber")
    void shouldExecuteChroniclesLifecycle() throws Exception {
        CampaignChronicleCreateDTO c1 = CampaignChronicleCreateDTO.builder()
                .sessionNumber(1)
                .title("A Chegada a Malpetrim")
                .sessionDate(LocalDate.of(2026, 1, 15))
                .location("Malpetrim")
                .mission("Investigar navio fantasma")
                .narrative("A noite estava tempestuosa...")
                .build();

        CampaignChronicleCreateDTO c2 = CampaignChronicleCreateDTO.builder()
                .sessionNumber(2)
                .title("Nas Profundezas do Navio")
                .sessionDate(LocalDate.of(2026, 1, 22))
                .location("Navio Fantasma")
                .mission("Enfrentar o Capitão Esqueleto")
                .narrative("O convés rangia sob passos fantasmagóricos...")
                .build();

        // 1. Create session 1
        MvcResult res1 = mockMvc.perform(post("/api/campaigns/" + campaign.getId() + "/chronicles")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(c1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionNumber").value(1))
                .andExpect(jsonPath("$.title").value("A Chegada a Malpetrim"))
                .andReturn();

        String c1Id = objectMapper.readTree(res1.getResponse().getContentAsString()).get("id").asText();

        // 2. Create session 2
        mockMvc.perform(post("/api/campaigns/" + campaign.getId() + "/chronicles")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(c2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionNumber").value(2));

        // 3. Prevent duplicate session number
        mockMvc.perform(post("/api/campaigns/" + campaign.getId() + "/chronicles")
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(c1)))
                .andExpect(status().isConflict());

        // 4. Player lists chronicles
        mockMvc.perform(get("/api/campaigns/" + campaign.getId() + "/chronicles")
                        .header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].sessionNumber").value(1))
                .andExpect(jsonPath("$[1].sessionNumber").value(2));

        // 5. Update session 1
        c1.setTitle("A Chegada a Malpetrim (Expandida)");
        mockMvc.perform(put("/api/campaigns/" + campaign.getId() + "/chronicles/" + c1Id)
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(c1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("A Chegada a Malpetrim (Expandida)"));

        // 6. Delete session 1
        mockMvc.perform(delete("/api/campaigns/" + campaign.getId() + "/chronicles/" + c1Id)
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isNoContent());
    }
}
