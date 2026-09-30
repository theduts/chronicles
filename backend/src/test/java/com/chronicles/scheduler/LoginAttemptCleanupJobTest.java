package com.chronicles.scheduler;

import com.chronicles.domain.LoginAttempt;
import com.chronicles.repository.LoginAttemptRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
class LoginAttemptCleanupJobTest {

    @Autowired
    private LoginAttemptRepository loginAttemptRepository;

    @Autowired
    private LoginAttemptCleanupJob loginAttemptCleanupJob;

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("cleanupStaleAttempts should pass cutoff exactly 7 days before clock instant to repository")
    void shouldPassCorrectCutoffToRepository() {
        LoginAttemptRepository repository = mock(LoginAttemptRepository.class);
        Instant fixedInstant = Instant.parse("2026-10-15T12:00:00Z");
        Clock fixedClock = Clock.fixed(fixedInstant, ZoneOffset.UTC);

        LoginAttemptCleanupJob job = new LoginAttemptCleanupJob(repository, fixedClock);
        job.cleanupStaleAttempts();

        ArgumentCaptor<Instant> captor = ArgumentCaptor.forClass(Instant.class);
        verify(repository).deleteByLastAttemptAtBefore(captor.capture());

        Instant expectedCutoff = fixedInstant.minus(Duration.ofDays(7));
        assertThat(captor.getValue()).isEqualTo(expectedCutoff);
    }

    @Test
    @DisplayName("cleanupStaleAttempts integration should delete stale attempts and retain fresh attempts")
    void shouldDeleteStaleAttemptsAndRetainFreshAttempts() {
        Instant now = Instant.now();
        String uniqueStale = UUID.randomUUID().toString().substring(0, 8);
        String uniqueFresh = UUID.randomUUID().toString().substring(0, 8);

        LoginAttempt staleAttempt = loginAttemptRepository.save(LoginAttempt.builder()
                .ipAddress("192.168.1.10")
                .identifier("stale_" + uniqueStale + "@test.com")
                .attemptCount(2)
                .build());

        LoginAttempt freshAttempt = loginAttemptRepository.save(LoginAttempt.builder()
                .ipAddress("192.168.1.11")
                .identifier("fresh_" + uniqueFresh + "@test.com")
                .attemptCount(1)
                .build());

        entityManager.createNativeQuery("UPDATE login_attempts SET last_attempt_at = :stale WHERE id = :id")
                .setParameter("stale", now.minus(Duration.ofDays(10)))
                .setParameter("id", staleAttempt.getId())
                .executeUpdate();

        entityManager.flush();
        entityManager.clear();

        loginAttemptCleanupJob.cleanupStaleAttempts();

        assertThat(loginAttemptRepository.findById(staleAttempt.getId())).isEmpty();
        assertThat(loginAttemptRepository.findById(freshAttempt.getId())).isPresent();
    }
}
