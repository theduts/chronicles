package com.chronicles.service;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.CampaignChronicle;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.CampaignChronicleCreateDTO;
import com.chronicles.dto.CampaignChronicleDTO;
import com.chronicles.repository.CampaignChronicleRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CampaignChronicleServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private CampaignPlayerRepository campaignPlayerRepository;

    @Mock
    private CampaignChronicleRepository campaignChronicleRepository;

    @InjectMocks
    private CampaignChronicleService campaignChronicleService;

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
    @DisplayName("Lists chronicles ordered by session number ascending")
    void testGetChroniclesByCampaign_returnsOrderedChronicles() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignPlayerRepository.existsByCampaignIdAndUserId(campaignId, playerUser.getId())).thenReturn(true);

        CampaignChronicle c1 = CampaignChronicle.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .author(dmUser)
                .sessionNumber(1)
                .title("A Chegada à Taverna")
                .narrative("Os heróis se reúnem...")
                .build();

        CampaignChronicle c2 = CampaignChronicle.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .author(dmUser)
                .sessionNumber(2)
                .title("A Emboscada dos Goblins")
                .narrative("Flechas cortam a névoa...")
                .build();

        when(campaignChronicleRepository.findByCampaignIdOrderBySessionNumberAsc(campaignId)).thenReturn(List.of(c1, c2));

        List<CampaignChronicleDTO> result = campaignChronicleService.getChroniclesByCampaign(campaignId, playerUser);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getSessionNumber()).isEqualTo(1);
        assertThat(result.get(1).getSessionNumber()).isEqualTo(2);
        verify(campaignChronicleRepository, times(1)).findByCampaignIdOrderBySessionNumberAsc(campaignId);
    }

    @Test
    @DisplayName("DM creates chronicle successfully")
    void testCreateChronicle_asDm_createsSuccessfully() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignChronicleRepository.existsByCampaignIdAndSessionNumber(campaignId, 1)).thenReturn(false);

        CampaignChronicleCreateDTO request = CampaignChronicleCreateDTO.builder()
                .sessionNumber(1)
                .title("Sessão Inaugural")
                .sessionDate(LocalDate.now())
                .location("Valkaria")
                .mission("Investigar os esgotos")
                .narrative("A missão começa nas sombras...")
                .build();

        when(campaignChronicleRepository.save(any(CampaignChronicle.class))).thenAnswer(i -> {
            CampaignChronicle c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CampaignChronicleDTO result = campaignChronicleService.createChronicle(campaignId, request, dmUser);

        assertThat(result.getTitle()).isEqualTo("Sessão Inaugural");
        assertThat(result.getSessionNumber()).isEqualTo(1);
        assertThat(result.getAuthorName()).isEqualTo("mestre");
    }

    @Test
    @DisplayName("Creating chronicle with duplicate session number throws 409 Conflict")
    void testCreateChronicle_duplicateSessionNumber_throwsConflict() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignChronicleRepository.existsByCampaignIdAndSessionNumber(campaignId, 1)).thenReturn(true);

        CampaignChronicleCreateDTO request = CampaignChronicleCreateDTO.builder()
                .sessionNumber(1)
                .title("Sessão Duplicada")
                .narrative("Narrativa...")
                .build();

        assertThatThrownBy(() -> campaignChronicleService.createChronicle(campaignId, request, dmUser))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409 CONFLICT");
    }

    @Test
    @DisplayName("Player cannot create chronicle")
    void testCreateChronicle_asPlayer_throwsForbidden() {
        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

        CampaignChronicleCreateDTO request = CampaignChronicleCreateDTO.builder()
                .sessionNumber(1)
                .title("Sessão do Jogador")
                .narrative("Narrativa...")
                .build();

        assertThatThrownBy(() -> campaignChronicleService.createChronicle(campaignId, request, playerUser))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
    }
}
