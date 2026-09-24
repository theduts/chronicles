package com.chronicles.controller;

import com.chronicles.dto.auth.LoginRequest;
import com.chronicles.dto.auth.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/register should create user and return 201 with JWT token")
    void shouldRegisterUserSuccessfully() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest request = new RegisterRequest(
                "user_" + unique,
                "user_" + unique + "@chronicles.com",
                "secret123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("user_" + unique))
                .andExpect(jsonPath("$.email").value("user_" + unique + "@chronicles.com"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("POST /api/auth/register with duplicate email should return 409 Conflict")
    void shouldFailRegistrationWhenEmailAlreadyExists() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest request = new RegisterRequest(
                "user_" + unique,
                "duplicate_" + unique + "@chronicles.com",
                "secret123"
        );

        // First registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate registration attempt
        RegisterRequest duplicate = new RegisterRequest(
                "other_" + unique,
                "duplicate_" + unique + "@chronicles.com",
                "anotherpass"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/auth/register with invalid data should return 400 Bad Request with ProblemDetails")
    void shouldFailRegistrationWithInvalidData() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest(
                "a", // too short (< 3)
                "not-an-email",
                "123" // too short (< 6)
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Requisição Inválida"))
                .andExpect(jsonPath("$.errors.username").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate registered user and return 200 with JWT")
    void shouldLoginSuccessfully() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest regRequest = new RegisterRequest(
                "login_" + unique,
                "login_" + unique + "@chronicles.com",
                "pass12345"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest(
                "login_" + unique + "@chronicles.com",
                "pass12345"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.email").value("login_" + unique + "@chronicles.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login with wrong credentials should return 401 Unauthorized")
    void shouldFailLoginWithWrongPassword() throws Exception {
        LoginRequest invalidLogin = new LoginRequest(
                "nonexistent@chronicles.com",
                "wrongpass"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Credenciais Inválidas"));
    }
}
