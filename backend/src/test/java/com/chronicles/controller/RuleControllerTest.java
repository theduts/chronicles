package com.chronicles.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/rules/levelup: should return official levelup rules from database")
    void shouldReturnLevelUpRules() throws Exception {
        mockMvc.perform(get("/api/rules/levelup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.niveis_personagem", notNullValue()))
                .andExpect(jsonPath("$.niveis_personagem.1.exp_necessaria").value(0))
                .andExpect(jsonPath("$.niveis_personagem.2.exp_necessaria").value(5))
                .andExpect(jsonPath("$.niveis_personagem.2.pericias").value(35))
                .andExpect(jsonPath("$.niveis_montaria", notNullValue()))
                .andExpect(jsonPath("$.niveis_familiar", notNullValue()))
                .andExpect(jsonPath("$.niveis_companheiro", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/rules/unknown_rule: should return 404 Not Found")
    void shouldReturnNotFoundForUnknownRule() throws Exception {
        mockMvc.perform(get("/api/rules/non_existent_rule_key"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/rules: should list all system rules")
    void shouldListAllSystemRules() throws Exception {
        mockMvc.perform(get("/api/rules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()));
    }
}
