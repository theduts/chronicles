package com.chronicles.dto.auth;

import com.chronicles.domain.Role;
import com.chronicles.domain.User;

import java.util.UUID;

public record UserSessionResponse(
    UUID id,
    String username,
    String email,
    Role role,
    String lastViewMode,
    UUID lastCampaignDmSession,
    UUID lastCampaignPlayerSession
) {
    public static UserSessionResponse of(User user) {
        return new UserSessionResponse(user.getId(), user.getActualUsername(), user.getEmail(),
                user.getRole(), user.getLastViewMode(),
                user.getLastCampaignDmSession(), user.getLastCampaignPlayerSession());
    }
}
