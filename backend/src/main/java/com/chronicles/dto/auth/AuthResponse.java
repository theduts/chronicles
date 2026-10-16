package com.chronicles.dto.auth;

import com.chronicles.domain.Role;
import com.chronicles.domain.User;

import java.util.UUID;

public record AuthResponse(
    String token,
    String type,
    UUID id,
    String username,
    String email,
    Role role,
    String lastViewMode,
    UUID lastCampaignDmSession,
    UUID lastCampaignPlayerSession
) {
    public static AuthResponse of(String token, User user) {
        return new AuthResponse(token, "Bearer", user.getId(), user.getActualUsername(), user.getEmail(),
                user.getRole(), user.getLastViewMode(),
                user.getLastCampaignDmSession(), user.getLastCampaignPlayerSession());
    }
}
