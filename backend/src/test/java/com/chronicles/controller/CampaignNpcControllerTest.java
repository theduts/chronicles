package com.chronicles.controller;

import com.chronicles.domain.*;
import com.chronicles.dto.CampaignNpcCreateDTO;
import com.chronicles.repository.CampaignNpcRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CampaignNpcControllerTest {

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
    private CampaignNpcRepository campaignNpcRepository;

    @Autowired
    private JwtService jwtService;

    private User dmUser;
    private User playerUser;
    private String dmToken;
    private String playerToken;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        dmUser = userRepository.save(User.builder()
                .username("dm_npc_" + UUID.randomUUID().toString().substring(0, 8))
                .email("dm_npc_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com")
                .passwordHash("hash")
                .role(Role.ROLE_USER)
                .build());

        playerUser = userRepository.save(User.builder()
                .username("player_npc_" + UUID.randomUUID().toString().substring(0, 8))
                .email("player_npc_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com")
                .passwordHash("hash")
                .role(Role.ROLE_USER)
                .build());

        dmToken = "Bearer " + jwtService.generateToken(dmUser);
        playerToken = "Bearer " + jwtService.generateToken(playerUser);

        campaign = campaignRepository.save(Campaign.builder()
                .name("Campanha dos NPCs")
                .dm(dmUser)
                .inviteCode("NPC" + UUID.randomUUID().toString().substring(0, 6))
                .build());

        campaignPlayerRepository.save(CampaignPlayer.builder()
                .id(new CampaignPlayerId(campaign.getId(), playerUser.getId()))
                .campaign(campaign)
                .user(playerUser)
                .build());
    }

    @Test
    @DisplayName("POST /api/campaigns/{campaignId}/npcs - Mestre cria NPC com sucesso")
    void createNpc_asDm_returnsCreated() throws Exception {
        CampaignNpcCreateDTO request = CampaignNpcCreateDTO.builder()
                .name("Garrick o Ferreiro")
                .race("Anão")
                .occupation("Armeiro")
                .description("Um experiente artesão de armas élficas.")
                .notes("Guarda um mapa secreto sob a forja.")
                .portraitUrl("https://example.com/garrick.png")
                .isPersona(false)
                .build();

        mockMvc.perform(post("/api/campaigns/{campaignId}/npcs", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Garrick o Ferreiro"))
                .andExpect(jsonPath("$.race").value("Anão"))
                .andExpect(jsonPath("$.occupation").value("Armeiro"))
                .andExpect(jsonPath("$.notes").value("Guarda um mapa secreto sob a forja."))
                .andExpect(jsonPath("$.isPersona").value(false));
    }

    @Test
    @DisplayName("POST /api/campaigns/{campaignId}/npcs - Jogador tenta criar NPC e recebe 403 Forbidden")
    void createNpc_asPlayer_returnsForbidden() throws Exception {
        CampaignNpcCreateDTO request = CampaignNpcCreateDTO.builder()
                .name("NPC Ilegal")
                .build();

        mockMvc.perform(post("/api/campaigns/{campaignId}/npcs", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, playerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/campaigns/{campaignId}/npcs - Mestre lista NPCs e vê notas secretas")
    void getNpcs_asDm_returnsListWithNotes() throws Exception {
        campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("Lorde Blackwood")
                .race("Humano")
                .occupation("Nobre")
                .notes("Vampiro disfarçado")
                .build());

        mockMvc.perform(get("/api/campaigns/{campaignId}/npcs", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Lorde Blackwood"))
                .andExpect(jsonPath("$[0].notes").value("Vampiro disfarçado"));
    }

    @Test
    @DisplayName("GET /api/campaigns/{campaignId}/npcs - Jogador lista NPCs com notas confidenciais mascaradas")
    void getNpcs_asPlayer_returnsListWithoutNotes() throws Exception {
        campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("Lorde Blackwood")
                .race("Humano")
                .occupation("Nobre")
                .notes("Vampiro disfarçado")
                .build());

        mockMvc.perform(get("/api/campaigns/{campaignId}/npcs", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Lorde Blackwood"))
                .andExpect(jsonPath("$[0].notes").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/campaigns/{campaignId}/npcs/{npcId}/promote - Promover NPC a Persona persiste e sincroniza na Lore")
    void promoteNpc_asDm_returnsUpdatedNpc() throws Exception {
        CampaignNpc npc = campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("Elena a Feiticeira")
                .race("Elfa")
                .occupation("Maga de Batalha")
                .description("Guardiã do círculo místico.")
                .portraitUrl("https://example.com/elena.png")
                .isPersona(false)
                .build());

        mockMvc.perform(post("/api/campaigns/{campaignId}/npcs/{npcId}/promote", campaign.getId(), npc.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(npc.getId().toString()))
                .andExpect(jsonPath("$.isPersona").value(true));

        // Verificar que também é retornado nos artigos de Lore na categoria persona
        mockMvc.perform(get("/api/campaigns/{campaignId}/lore", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.category == 'persona')].title").value("Elena a Feiticeira"))
                .andExpect(jsonPath("$[?(@.category == 'persona')].data.race").value("Elfa"))
                .andExpect(jsonPath("$[?(@.category == 'persona')].data.role").value("Maga de Batalha"));
    }

    @Test
    @DisplayName("DELETE /api/campaigns/{campaignId}/npcs/{npcId} - Mestre remove NPC")
    void deleteNpc_asDm_returnsNoContent() throws Exception {
        CampaignNpc npc = campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("Bandido Comum")
                .build());

        mockMvc.perform(delete("/api/campaigns/{campaignId}/npcs/{npcId}", campaign.getId(), npc.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/campaigns/{campaignId}/npcs/{npcId}", campaign.getId(), npc.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/campaigns/{campaignId}/npcs - Mestre cria NPC com dados de combate e como template")
    void createNpc_withCombatDataAndTemplate_asDm_returnsCreated() throws Exception {
        java.util.Map<String, Object> combatData = new java.util.HashMap<>();
        combatData.put("pv", 20);
        combatData.put("ip", 2);
        combatData.put("deslocamento", 4);
        combatData.put("atributos", java.util.Map.of("CON", 15, "FOR", 14));

        CampaignNpcCreateDTO request = CampaignNpcCreateDTO.builder()
                .name("Guarda Veterano")
                .race("Humano")
                .occupation("Soldado")
                .description("Guarda experiente.")
                .notes("Segredo de guarnição")
                .isPersona(false)
                .data(combatData)
                .isTemplate(true)
                .build();

        mockMvc.perform(post("/api/campaigns/{campaignId}/npcs", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Guarda Veterano"))
                .andExpect(jsonPath("$.data.pv").value(20))
                .andExpect(jsonPath("$.data.ip").value(2))
                .andExpect(jsonPath("$.isTemplate").value(true));
    }

    @Test
    @DisplayName("GET /api/campaigns/{campaignId}/npcs - Jogador não vê combat data nem segredos")
    void getNpcs_asPlayer_masksNotesAndCombatData() throws Exception {
        java.util.Map<String, Object> combatData = new java.util.HashMap<>();
        combatData.put("pv", 30);

        campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("Lorde Secreto")
                .notes("Nota secreta do DM")
                .data(combatData)
                .isPersona(true)
                .build());

        mockMvc.perform(get("/api/campaigns/{campaignId}/npcs", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, playerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Lorde Secreto"))
                .andExpect(jsonPath("$[0].notes").doesNotExist())
                .andExpect(jsonPath("$[0].data").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/campaigns/{campaignId}/npcs?personaOnly=true - Filtra apenas Personas")
    void getNpcs_withPersonaOnly_filtersCorrectly() throws Exception {
        campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("NPC Normal")
                .isPersona(false)
                .build());

        campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("NPC Persona")
                .isPersona(true)
                .build());

        mockMvc.perform(get("/api/campaigns/{campaignId}/npcs?personaOnly=true", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("NPC Persona"));
    }

    @Test
    @DisplayName("GET /api/campaigns/{campaignId}/npcs?templateOnly=true - Filtra apenas Templates")
    void getNpcs_withTemplateOnly_filtersCorrectly() throws Exception {
        campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("NPC Padrão")
                .isTemplate(false)
                .build());

        campaignNpcRepository.save(CampaignNpc.builder()
                .campaign(campaign)
                .name("Modelo Template")
                .isTemplate(true)
                .build());

        mockMvc.perform(get("/api/campaigns/{campaignId}/npcs?templateOnly=true", campaign.getId())
                        .header(HttpHeaders.AUTHORIZATION, dmToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Modelo Template"));
    }
}
