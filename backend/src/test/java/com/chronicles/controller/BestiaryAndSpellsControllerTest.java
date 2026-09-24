package com.chronicles.controller;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.bestiary.BestiaryRequest;
import com.chronicles.dto.contract.ContractRequest;
import com.chronicles.dto.spell.SpellRequest;
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

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BestiaryAndSpellsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private String jwtToken;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        testUser = userRepository.save(User.builder()
                .username("lore_master_" + unique)
                .email("lore_" + unique + "@chronicles.com")
                .passwordHash("hashed")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build());
        jwtToken = "Bearer " + jwtService.generateToken(testUser);

        campaign = campaignRepository.save(Campaign.builder()
                .dm(testUser)
                .name("Campanha do Bestiário")
                .inviteCode("BEST" + unique)
                .build());
    }

    @Test
    @DisplayName("GET /api/bestiary should return official seeded monsters (Flyway V3)")
    void shouldReturnOfficialBestiaryMonsters() throws Exception {
        mockMvc.perform(get("/api/bestiary")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].isOfficial").value(true));
    }

    @Test
    @DisplayName("POST and GET /api/bestiary with campaignId should create and retrieve campaign monster")
    void shouldCreateAndRetrieveCampaignMonster() throws Exception {
        BestiaryRequest request = BestiaryRequest.builder()
                .name("Quimera Abissal")
                .category("MONSTRO")
                .pv(45)
                .ip(4)
                .movement("Voo 18m")
                .campaignId(campaign.getId())
                .attributes(Map.of("FR", 18, "CON", 16, "DEX", 14))
                .build();

        mockMvc.perform(post("/api/bestiary")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Quimera Abissal"))
                .andExpect(jsonPath("$.isOfficial").value(false));

        mockMvc.perform(get("/api/bestiary")
                        .param("campaignId", campaign.getId().toString())
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST and GET /api/spells should create and retrieve spells")
    void shouldCreateAndRetrieveSpells() throws Exception {
        SpellRequest request = SpellRequest.builder()
                .name("Bola de Fogo")
                .schoolOrFocus("Fogo / Criar")
                .level(3)
                .description("Uma explosão flamejante atinge uma área de 6 metros.")
                .systemSlug("daemon")
                .data(Map.of("cost", "3 PM", "range", "30m"))
                .build();

        mockMvc.perform(post("/api/spells")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Bola de Fogo"))
                .andExpect(jsonPath("$.schoolOrFocus").value("Fogo / Criar"));

        mockMvc.perform(get("/api/spells")
                        .param("systemSlug", "daemon")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST and GET /api/contracts should manage mission board")
    void shouldCreateAndRetrieveContracts() throws Exception {
        ContractRequest request = ContractRequest.builder()
                .campaignId(campaign.getId())
                .title("Eliminar o Ninho de Goblins")
                .description("Recompensa pela cabeça do chefe goblin.")
                .hasReward(true)
                .rewardValue(50)
                .currency("PO")
                .build();

        mockMvc.perform(post("/api/contracts")
                        .header(HttpHeaders.AUTHORIZATION, jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Eliminar o Ninho de Goblins"))
                .andExpect(jsonPath("$.rewardValue").value(50));

        mockMvc.perform(get("/api/contracts")
                        .param("campaignId", campaign.getId().toString())
                        .header(HttpHeaders.AUTHORIZATION, jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
}
