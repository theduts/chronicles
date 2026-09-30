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
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
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
        String unique = UUID.randomUUID().toString().substring(0, 8);
        LoginRequest invalidLogin = new LoginRequest(
                "nonexistent_" + unique + "@chronicles.com",
                "wrongpass"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Credenciais Inválidas"));
    }

    @Test
    @DisplayName("POST /api/auth/login should block with 429 Too Many Requests on third failed attempt")
    void shouldBlockLoginWithTooManyRequestsOnThirdFailedAttempt() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String email = "rate_" + unique + "@chronicles.com";
        RegisterRequest regRequest = new RegisterRequest(
                "rate_" + unique,
                email,
                "validpass123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated());

        LoginRequest wrongLogin = new LoginRequest(email, "wrongpass");

        // Attempt 1: 401
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin)))
                .andExpect(status().isUnauthorized());

        // Attempt 2: 401
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin)))
                .andExpect(status().isUnauthorized());

        // Attempt 3: 429 Too Many Requests with Retry-After header
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(result -> {
                    String retryHeader = result.getResponse().getHeader("Retry-After");
                    org.junit.jupiter.api.Assertions.assertNotNull(retryHeader);
                    long seconds = Long.parseLong(retryHeader);
                    org.junit.jupiter.api.Assertions.assertTrue(seconds > 0 && seconds <= 60);
                })
                .andExpect(jsonPath("$.title").value("Bloqueio Temporário"))
                .andExpect(jsonPath("$.retryAfterSeconds").exists());
    }

    @Test
    @DisplayName("POST /api/auth/login should not block a different identifier from the same IP address")
    void shouldNotBlockDifferentIdentifierFromSameAddress() throws Exception {
        String unique1 = UUID.randomUUID().toString().substring(0, 8);
        String unique2 = UUID.randomUUID().toString().substring(0, 8);
        String email1 = "user1_" + unique1 + "@chronicles.com";
        String email2 = "user2_" + unique2 + "@chronicles.com";

        // Register user 2
        RegisterRequest regRequest2 = new RegisterRequest(
                "user2_" + unique2,
                email2,
                "validpass123"
        );
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest2)))
                .andExpect(status().isCreated());

        // Drive email1 to lockout with 3 failed attempts
        LoginRequest wrongLogin1 = new LoginRequest(email1, "wrongpass");
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(wrongLogin1)));
        }

        // Email1 is locked out
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin1)))
                .andExpect(status().isTooManyRequests());

        // Email2 from the same client IP authenticates with 200 OK
        LoginRequest validLogin2 = new LoginRequest(email2, "validpass123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());
    }
}

