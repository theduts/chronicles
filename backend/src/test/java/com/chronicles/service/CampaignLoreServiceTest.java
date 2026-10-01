package com.chronicles.service;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.CampaignLore;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.CampaignLoreCreateDTO;
import com.chronicles.dto.CampaignLoreDTO;
import com.chronicles.repository.CampaignLoreRepository;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class CampaignLoreServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private CampaignPlayerRepository campaignPlayerRepository;

    @Mock
    private CampaignLoreRepository campaignLoreRepository;

    @InjectMocks
    private CampaignLoreService campaignLoreService;

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
                .name("Tormenta 20")
                .dm(dmUser)
                .build();
    }

    @Test
    @DisplayName("DM can see all lore items including hidden ones")
    void testGetLoreByCampaign_asDm_returnsAllLore() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignLore visibleLore = CampaignLore.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .category("deidade")
                .title("Valkaria")
                .isVisible(true)
                .data(Map.of("crencas", "Liberdade"))
                .build();

        CampaignLore hiddenLore = CampaignLore.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .category("faccao")
                .title("Puristas Ocultos")
                .isVisible(false)
                .data(Map.of("segredo", "Lorde da Tormenta"))
                .build();

        when(campaignLoreRepository.findByCampaignId(campaignId)).thenReturn(List.of(visibleLore, hiddenLore));

        List<CampaignLoreDTO> result = campaignLoreService.getLoreByCampaign(campaignId, dmUser);

        assertThat(result).hasSize(2);
        verify(campaignLoreRepository, times(1)).findByCampaignId(campaignId);
        verify(campaignLoreRepository, never()).findByCampaignIdAndIsVisibleTrue(any());
    }

    @Test
    @DisplayName("Player sees only visible lore items")
    void testGetLoreByCampaign_asPlayer_returnsVisibleLoreOnly() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignPlayerRepository.existsByCampaignIdAndUserId(campaignId, playerUser.getId())).thenReturn(true);

        CampaignLore visibleLore = CampaignLore.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .category("deidade")
                .title("Valkaria")
                .isVisible(true)
                .data(Map.of("crencas", "Liberdade"))
                .build();

        when(campaignLoreRepository.findByCampaignIdAndIsVisibleTrue(campaignId)).thenReturn(List.of(visibleLore));

        List<CampaignLoreDTO> result = campaignLoreService.getLoreByCampaign(campaignId, playerUser);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Valkaria");
        verify(campaignLoreRepository, times(1)).findByCampaignIdAndIsVisibleTrue(campaignId);
        verify(campaignLoreRepository, never()).findByCampaignId(any());
    }

    @Test
    @DisplayName("Non-participant gets 403 Forbidden")
    void testGetLoreByCampaign_asStranger_throwsForbidden() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignPlayerRepository.existsByCampaignIdAndUserId(campaignId, strangerUser.getId())).thenReturn(false);

        assertThatThrownBy(() -> campaignLoreService.getLoreByCampaign(campaignId, strangerUser))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
    }

    @Test
    @DisplayName("DM creates lore item successfully")
    void testCreateLore_asDm_createsSuccessfully() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignLoreCreateDTO request = CampaignLoreCreateDTO.builder()
                .category("geografia")
                .title("Valkaria Capital")
                .description("Capital do Reinado")
                .isVisible(true)
                .data(Map.of("populacao", 500000))
                .build();

        when(campaignLoreRepository.save(any(CampaignLore.class))).thenAnswer(invocation -> {
            CampaignLore lore = invocation.getArgument(0);
            lore.setId(UUID.randomUUID());
            return lore;
        });

        CampaignLoreDTO result = campaignLoreService.createLore(campaignId, request, dmUser);

        assertThat(result.getTitle()).isEqualTo("Valkaria Capital");
        assertThat(result.getCategory()).isEqualTo("geografia");
        assertThat(result.getData()).containsEntry("populacao", 500000);
    }

    @Test
    @DisplayName("Player cannot create lore item")
    void testCreateLore_asPlayer_throwsForbidden() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignLoreCreateDTO request = CampaignLoreCreateDTO.builder()
                .category("geografia")
                .title("Valkaria Capital")
                .build();

        assertThatThrownBy(() -> campaignLoreService.createLore(campaignId, request, playerUser))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
    }

    @Test
    @DisplayName("DM can update lore visibility")
    void testUpdateLoreVisibility_asDm_togglesSuccessfully() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        UUID loreId = UUID.randomUUID();
        CampaignLore lore = CampaignLore.builder()
                .id(loreId)
                .campaign(campaign)
                .category("deidade")
                .title("Kallyadranoch")
                .isVisible(false)
                .data(Collections.emptyMap())
                .build();

        when(campaignLoreRepository.findByIdAndCampaignId(loreId, campaignId)).thenReturn(Optional.of(lore));
        when(campaignLoreRepository.save(any(CampaignLore.class))).thenAnswer(i -> i.getArgument(0));

        CampaignLoreDTO result = campaignLoreService.updateLoreVisibility(campaignId, loreId, true, dmUser);

        assertThat(result.getIsVisible()).isTrue();
    }
}
