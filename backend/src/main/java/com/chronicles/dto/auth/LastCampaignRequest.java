package com.chronicles.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record LastCampaignRequest(
        @NotBlank(message = "O modo de visualização é obrigatório")
        @Pattern(regexp = "^(PLAYER|DM)$", message = "O modo de visualização deve ser PLAYER ou DM")
        String mode,
        UUID campaignId
) {}
