package com.chronicles.dto.auth;

import com.chronicles.domain.Role;

import java.util.UUID;

public record AuthResponse(
    String token,
    String type,
    UUID id,
    String username,
    String email,
    Role role,
    String lastViewMode
) {
    public static AuthResponse of(String token, UUID id, String username, String email, Role role, String lastViewMode) {
        return new AuthResponse(token, "Bearer", id, username, email, role, lastViewMode);
    }
}
