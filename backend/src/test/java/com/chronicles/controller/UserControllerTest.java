package com.chronicles.controller;

import com.chronicles.dto.auth.LoginRequest;
import com.chronicles.dto.auth.RegisterRequest;
import com.chronicles.dto.auth.ViewModeRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String getAuthToken() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest request = new RegisterRequest(
                "user_" + unique,
                "user_" + unique + "@chronicles.com",
                "secret123"
        );

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseStr).get("token").asText();
    }

    @Test
    @DisplayName("PATCH /api/users/me/view-mode should update view mode")
    void shouldUpdateViewMode() throws Exception {
        String token = getAuthToken();

        ViewModeRequest req = new ViewModeRequest("DM");
        mockMvc.perform(patch("/api/users/me/view-mode")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /api/users/me/view-mode with invalid mode should return 400")
    void shouldFailWithInvalidMode() throws Exception {
        String token = getAuthToken();

        ViewModeRequest req = new ViewModeRequest("INVALID");
        mockMvc.perform(patch("/api/users/me/view-mode")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.mode").exists());
    }

    @Test
    @DisplayName("PATCH /api/users/me/view-mode should enforce rate limit")
    void shouldEnforceRateLimit() throws Exception {
        String token = getAuthToken();

        ViewModeRequest req = new ViewModeRequest("PLAYER");

        for (int i = 0; i < 10; i++) {
            mockMvc.perform(patch("/api/users/me/view-mode")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isNoContent());
        }

        // 11th request should be blocked
        mockMvc.perform(patch("/api/users/me/view-mode")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests());
    }
}
