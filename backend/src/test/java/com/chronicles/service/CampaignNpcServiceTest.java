package com.chronicles.service;

import com.chronicles.domain.*;
import com.chronicles.dto.CampaignNpcCreateDTO;
import com.chronicles.dto.CampaignNpcDTO;
import com.chronicles.repository.CampaignLoreRepository;
import com.chronicles.repository.CampaignNpcRepository;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CampaignNpcServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private CampaignPlayerRepository campaignPlayerRepository;

    @Mock
    private CampaignNpcRepository campaignNpcRepository;

    @Mock
    private CampaignLoreRepository campaignLoreRepository;

    @InjectMocks
    private CampaignNpcService campaignNpcService;

    private User dmUser;
    private User playerUser;
    private User strangerUser;
    private Campaign campaign;
    private UUID campaignId;

    @BeforeEach
    void setUp() {
        campaignId = UUID.randomUUID();

        dmUser = User.builder()
                .id(UUID.randomUUID())
                .username("mestre")
                .email("mestre@chronicles.com")
                .role(Role.ROLE_USER)
                .build();

        playerUser = User.builder()
                .id(UUID.randomUUID())
                .username("jogador")
                .email("jogador@chronicles.com")
                .role(Role.ROLE_USER)
                .build();

        strangerUser = User.builder()
                .id(UUID.randomUUID())
                .username("estranho")
                .email("estranho@chronicles.com")
                .role(Role.ROLE_USER)
                .build();

        campaign = Campaign.builder()
                .id(campaignId)
                .name("Crônicas de Trevas")
                .dm(dmUser)
                .build();
    }

    @Test
    @DisplayName("Mestre deve conseguir criar NPC com sucesso")
    void createNpc_asDm_success() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignNpcRepository.save(any(CampaignNpc.class))).thenAnswer(invocation -> {
            CampaignNpc npc = invocation.getArgument(0);
            npc.setId(UUID.randomUUID());
            return npc;
        });

        CampaignNpcCreateDTO request = CampaignNpcCreateDTO.builder()
                .name("Padre Gregorio")
                .race("Humano")
                .occupation("Sacerdote")
                .description("Um padre enigmático da paróquia local.")
                .notes("Guarda segredos sobre os vampiros da cidade.")
                .portraitUrl("https://example.com/padre.jpg")
                .isPersona(false)
                .build();

        CampaignNpcDTO result = campaignNpcService.createNpc(campaignId, request, dmUser);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Padre Gregorio");
        assertThat(result.getRace()).isEqualTo("Humano");
        assertThat(result.getOccupation()).isEqualTo("Sacerdote");
        assertThat(result.getNotes()).isEqualTo("Guarda segredos sobre os vampiros da cidade.");
        assertThat(result.getIsPersona()).isFalse();

        verify(campaignNpcRepository).save(any(CampaignNpc.class));
        verify(campaignLoreRepository, never()).save(any(CampaignLore.class));
    }

    @Test
    @DisplayName("Jogador não pode criar NPC (deve lançar 403 Forbidden)")
    void createNpc_asPlayer_forbidden() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignNpcCreateDTO request = CampaignNpcCreateDTO.builder()
                .name("Tentativa de NPC")
                .build();

        assertThatThrownBy(() -> campaignNpcService.createNpc(campaignId, request, playerUser))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Apenas o Mestre pode realizar esta operação");

        verify(campaignNpcRepository, never()).save(any());
    }

    @Test
    @DisplayName("Mestre visualiza lista de NPCs com notas confidenciais")
    void getNpcsByCampaign_asDm_returnsNotes() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignNpc npc = CampaignNpc.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .name("Ferreiro Thorin")
                .race("Anão")
                .occupation("Armeiro")
                .notes("Ele é um informante secreto.")
                .isPersona(false)
                .build();

        when(campaignNpcRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId))
                .thenReturn(List.of(npc));

        List<CampaignNpcDTO> result = campaignNpcService.getNpcsByCampaign(campaignId, dmUser);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Ferreiro Thorin");
        assertThat(result.get(0).getNotes()).isEqualTo("Ele é um informante secreto.");
    }

    @Test
    @DisplayName("Jogador visualiza lista de NPCs mas tem as notas confidenciais mascaradas")
    void getNpcsByCampaign_asPlayer_masksNotes() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignPlayerRepository.existsByCampaignIdAndUserId(campaignId, playerUser.getId()))
                .thenReturn(true);

        CampaignNpc npc = CampaignNpc.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .name("Ferreiro Thorin")
                .race("Anão")
                .occupation("Armeiro")
                .notes("Ele é um informante secreto.")
                .isPersona(false)
                .build();

        when(campaignNpcRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId))
                .thenReturn(List.of(npc));

        List<CampaignNpcDTO> result = campaignNpcService.getNpcsByCampaign(campaignId, playerUser);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Ferreiro Thorin");
        assertThat(result.get(0).getNotes()).isNull(); // Mascarado para jogadores
    }

    @Test
    @DisplayName("Promover NPC a Persona deve atualizar isPersona e criar registro na campaign_lore")
    void promoteToPersona_asDm_success() {
        UUID npcId = UUID.randomUUID();
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignNpc npc = CampaignNpc.builder()
                .id(npcId)
                .campaign(campaign)
                .name("Capitão Valerius")
                .race("Humano")
                .occupation("Comandante da Guarda")
                .description("Guardião leal da cidadela.")
                .notes("Gostaria de se rebelar contra o rei corrupto.")
                .portraitUrl("https://example.com/valerius.jpg")
                .isPersona(false)
                .build();

        when(campaignNpcRepository.findByIdAndCampaignId(npcId, campaignId))
                .thenReturn(Optional.of(npc));
        when(campaignNpcRepository.save(any(CampaignNpc.class))).thenAnswer(i -> i.getArgument(0));
        when(campaignLoreRepository.findByCampaignId(campaignId)).thenReturn(Collections.emptyList());

        CampaignNpcDTO result = campaignNpcService.promoteToPersona(campaignId, npcId, dmUser);

        assertThat(result.getIsPersona()).isTrue();
        verify(campaignNpcRepository).save(npc);

        ArgumentCaptor<CampaignLore> loreCaptor = ArgumentCaptor.forClass(CampaignLore.class);
        verify(campaignLoreRepository).save(loreCaptor.capture());

        CampaignLore savedLore = loreCaptor.getValue();
        assertThat(savedLore.getCategory()).isEqualTo("persona");
        assertThat(savedLore.getTitle()).isEqualTo("Capitão Valerius");
        assertThat(savedLore.getDescription()).isEqualTo("Guardião leal da cidadela.");
        assertThat(savedLore.getImageUrl()).isEqualTo("https://example.com/valerius.jpg");
        assertThat(savedLore.getIsVisible()).isTrue();
        assertThat(savedLore.getData()).containsEntry("role", "Comandante da Guarda");
        assertThat(savedLore.getData()).containsEntry("race", "Humano");
        assertThat(savedLore.getData()).doesNotContainKey("notes");
        assertThat(savedLore.getData()).containsEntry("npcId", npcId.toString());
        assertThat(savedLore.getData().get("title")).isEqualTo("Humano • Comandante da Guarda");
    }

    @Test
    @DisplayName("Deletar NPC deve remover entidade do repositório")
    void deleteNpc_asDm_success() {
        UUID npcId = UUID.randomUUID();
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignNpc npc = CampaignNpc.builder()
                .id(npcId)
                .campaign(campaign)
                .name("NPC para Excluir")
                .build();

        when(campaignNpcRepository.findByIdAndCampaignId(npcId, campaignId))
                .thenReturn(Optional.of(npc));

        campaignNpcService.deleteNpc(campaignId, npcId, dmUser);

        verify(campaignNpcRepository).delete(npc);
    }
}
