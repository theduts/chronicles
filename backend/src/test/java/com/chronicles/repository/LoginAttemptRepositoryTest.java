package com.chronicles.repository;

import com.chronicles.domain.LoginAttempt;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class LoginAttemptRepositoryTest {

    @Autowired
    private LoginAttemptRepository loginAttemptRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("saved row should be retrievable by (ip, identifier) after entity manager flush and clear (database roundtrip)")
    void shouldPersistAndRetrieveAcrossPersistenceContextClear() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String ip = "192.168.100." + (int)(Math.random() * 200 + 1);
        String identifier = "user_" + unique + "@chronicles.com";

        LoginAttempt attempt = LoginAttempt.builder()
                .ipAddress(ip)
                .identifier(identifier)
                .attemptCount(2)
                .build();

        loginAttemptRepository.save(attempt);
        entityManager.flush();
        entityManager.clear();

        Optional<LoginAttempt> retrieved = loginAttemptRepository.findByIpAddressAndIdentifier(ip, identifier);
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getAttemptCount()).isEqualTo(2);
        assertThat(retrieved.get().getIpAddress()).isEqualTo(ip);
        assertThat(retrieved.get().getIdentifier()).isEqualTo(identifier);
        assertThat(retrieved.get().getFirstAttemptAt()).isNotNull();
        assertThat(retrieved.get().getLastAttemptAt()).isNotNull();
    }

    @Test
    @DisplayName("saving duplicate (ip, identifier) row should violate unique constraint on flush")
    void shouldEnforceUniqueConstraintOnFlush() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String ip = "192.168.101.50";
        String identifier = "dup_" + unique + "@chronicles.com";

        LoginAttempt attempt1 = LoginAttempt.builder()
                .ipAddress(ip)
                .identifier(identifier)
                .attemptCount(1)
                .build();

        loginAttemptRepository.save(attempt1);
        entityManager.flush();

        LoginAttempt attempt2 = LoginAttempt.builder()
                .ipAddress(ip)
                .identifier(identifier)
                .attemptCount(2)
                .build();

        loginAttemptRepository.save(attempt2);

        assertThatThrownBy(() -> entityManager.flush())
                .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("deleteByLastAttemptAtBefore should delete only rows strictly before cutoff")
    void shouldDeleteOnlyStaleAttempts() {
        Instant now = Instant.now();
        String uniqueStale = UUID.randomUUID().toString().substring(0, 8);
        String uniqueFresh = UUID.randomUUID().toString().substring(0, 8);

        LoginAttempt staleAttempt = loginAttemptRepository.save(LoginAttempt.builder()
                .ipAddress("192.168.102.1")
                .identifier("stale_" + uniqueStale + "@chronicles.com")
                .attemptCount(1)
                .build());

        LoginAttempt freshAttempt = loginAttemptRepository.save(LoginAttempt.builder()
                .ipAddress("192.168.102.2")
                .identifier("fresh_" + uniqueFresh + "@chronicles.com")
                .attemptCount(1)
                .build());

        entityManager.createNativeQuery("UPDATE login_attempts SET last_attempt_at = :stale WHERE id = :id")
                .setParameter("stale", now.minus(Duration.ofDays(10)))
                .setParameter("id", staleAttempt.getId())
                .executeUpdate();

        entityManager.flush();
        entityManager.clear();

        Instant cutoff = now.minus(Duration.ofDays(7));
        long deleted = loginAttemptRepository.deleteByLastAttemptAtBefore(cutoff);
        entityManager.flush();
        entityManager.clear();

        assertThat(deleted).isGreaterThanOrEqualTo(1);
        assertThat(loginAttemptRepository.findById(staleAttempt.getId())).isEmpty();
        assertThat(loginAttemptRepository.findById(freshAttempt.getId())).isPresent();
    }
}
