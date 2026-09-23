package com.chronicles.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI chroniclesOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Chronicles RPG API")
                        .description("REST API backend for the Chronicles RPG virtual tabletop and campaign manager (Daemon / Tormenta Daemon ruleset).")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Chronicles RPG Team")
                                .email("contact@chronicles.rpg"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
