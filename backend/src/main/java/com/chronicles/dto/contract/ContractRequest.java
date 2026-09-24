package com.chronicles.dto.contract;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRequest {
    @NotNull(message = "O ID da campanha é obrigatório")
    private UUID campaignId;

    @NotBlank(message = "O título da missão/contrato é obrigatório")
    private String title;

    private String description;
    private String status;
    private Boolean hasReward;
    private Integer rewardValue;
    private String currency;
    private String rewardItem;
}
