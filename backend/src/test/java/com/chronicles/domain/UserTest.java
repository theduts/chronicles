package com.chronicles.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    @DisplayName("User entity should correctly implement UserDetails and authorities")
    void shouldImplementUserDetailsCorrectly() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("MestreHeroico")
                .email("mestre@chronicles.com")
                .passwordHash("hashed_secret")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build();

        assertThat(user.getUsername()).isEqualTo("mestre@chronicles.com");
        assertThat(user.getActualUsername()).isEqualTo("MestreHeroico");
        assertThat(user.getPassword()).isEqualTo("hashed_secret");
        assertThat(user.isEnabled()).isTrue();
        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        assertThat(authorities).hasSize(1);
        assertThat(authorities.iterator().next().getAuthority()).isEqualTo("ROLE_ADMIN");
    }

    @Test
    @DisplayName("User should be disabled when isActive is false")
    void shouldBeDisabledWhenNotActive() {
        User user = User.builder()
                .username("Inativo")
                .email("inativo@chronicles.com")
                .isActive(false)
                .build();

        assertThat(user.isEnabled()).isFalse();
    }
}
