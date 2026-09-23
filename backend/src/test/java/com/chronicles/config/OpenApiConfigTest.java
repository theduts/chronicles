package com.chronicles.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class OpenApiConfigTest {

    @Autowired
    private OpenAPI openAPI;

    @Test
    @DisplayName("Should configure OpenAPI with Chronicles RPG API details")
    void shouldConfigureOpenApiBean() {
        assertThat(openAPI).isNotNull();
        assertThat(openAPI.getInfo()).isNotNull();
        assertThat(openAPI.getInfo().getTitle()).isEqualTo("Chronicles RPG API");
        assertThat(openAPI.getInfo().getVersion()).isEqualTo("1.0.0");
    }
}
