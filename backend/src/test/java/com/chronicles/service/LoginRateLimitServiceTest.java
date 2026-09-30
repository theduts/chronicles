package com.chronicles.service;

import com.chronicles.domain.LoginAttempt;
import com.chronicles.exception.LoginRateLimitException;
import com.chronicles.repository.LoginAttemptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class LoginRateLimitServiceTest {

    private LoginAttemptRepository repository;
    private MutableClock clock;
    private LoginRateLimitService service;
    private Map<String, LoginAttempt> storage;

    // Test double for Clock that allows moving time forward deterministically
    static class MutableClock extends Clock {
        private Instant currentInstant;
        private final ZoneOffset zone;

        MutableClock(Instant startInstant, ZoneOffset zone) {
            this.currentInstant = startInstant;
            this.zone = zone;
        }

        void advance(Duration duration) {
            this.currentInstant = this.currentInstant.plus(duration);
        }

        @Override
        public ZoneOffset getZone() {
            return zone;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return new MutableClock(currentInstant, (ZoneOffset) zone);
        }

        @Override
        public Instant instant() {
            return currentInstant;
        }
    }

    @BeforeEach
    void setUp() {
        repository = mock(LoginAttemptRepository.class);
        clock = new MutableClock(Instant.parse("2026-10-01T12:00:00Z"), ZoneOffset.UTC);
        service = new LoginRateLimitService(repository, clock);
        storage = new HashMap<>();

        // Wire mock repository to act as an in-memory storage for realistic continuous escalation
        when(repository.findByIpAddressAndIdentifier(anyString(), anyString())).thenAnswer(invocation -> {
            String ip = invocation.getArgument(0);
            String id = invocation.getArgument(1);
            return Optional.ofNullable(storage.get(ip + "#" + id));
        });

        when(repository.save(any(LoginAttempt.class))).thenAnswer(invocation -> {
            LoginAttempt attempt = invocation.getArgument(0);
            storage.put(attempt.getIpAddress() + "#" + attempt.getIdentifier(), attempt);
            return attempt;
        });

        doAnswer(invocation -> {
            LoginAttempt attempt = invocation.getArgument(0);
            storage.remove(attempt.getIpAddress() + "#" + attempt.getIdentifier());
            return null;
        }).when(repository).delete(any(LoginAttempt.class));
    }

    @Test
    @DisplayName("recordFailure on attempts 1 and 2 should record failure but not block")
    void shouldNotBlockOnFirstOrSecondAttempt() {
        String ip = "10.0.0.1";
        String email = "test@chronicles.com";

        service.recordFailure(ip, email);
        assertThat(storage.get(ip + "#" + email).getAttemptCount()).isEqualTo(1);
        assertThat(storage.get(ip + "#" + email).getBlockedUntil()).isNull();

        service.recordFailure(ip, email);
        assertThat(storage.get(ip + "#" + email).getAttemptCount()).isEqualTo(2);
        assertThat(storage.get(ip + "#" + email).getBlockedUntil()).isNull();

        // Check does not throw
        service.checkNotBlocked(ip, email);
    }

    @Test
    @DisplayName("recordFailure on attempt 3 should block for 1 minute (Tier 1)")
    void shouldBlockOnThirdAttemptForOneMinute() {
        String ip = "10.0.0.2";
        String email = "tier1@chronicles.com";

        service.recordFailure(ip, email);
        service.recordFailure(ip, email);

        assertThatThrownBy(() -> service.recordFailure(ip, email))
                .isInstanceOf(LoginRateLimitException.class)
                .satisfies(ex -> {
                    LoginRateLimitException rateEx = (LoginRateLimitException) ex;
                    assertThat(rateEx.getRetryAfterSeconds()).isBetween(58L, 60L);
                });

        LoginAttempt attempt = storage.get(ip + "#" + email);
        assertThat(attempt.getAttemptCount()).isEqualTo(3);
        assertThat(attempt.getBlockedUntil()).isEqualTo(clock.instant().plus(Duration.ofMinutes(1)));
    }

    @Test
    @DisplayName("recordFailure on attempt 5 should escalate block to 5 minutes (Tier 2)")
    void shouldEscalateToFiveMinutesOnFifthAttempt() {
        String ip = "10.0.0.3";
        String email = "tier2@chronicles.com";

        // Attempts 1 to 3
        service.recordFailure(ip, email);
        service.recordFailure(ip, email);
        try { service.recordFailure(ip, email); } catch (LoginRateLimitException ignored) {}

        // Advance clock past Tier 1 block of attempt 3
        clock.advance(Duration.ofSeconds(65));

        // Attempt 4 (also triggers Tier 1 block: 1 min, as attemptCount is 4 >= 3)
        try { service.recordFailure(ip, email); } catch (LoginRateLimitException ignored) {}

        // Advance clock past Tier 1 block of attempt 4
        clock.advance(Duration.ofSeconds(65));

        // Attempt 5 (Tier 2 block: 5 min)
        assertThatThrownBy(() -> service.recordFailure(ip, email))
                .isInstanceOf(LoginRateLimitException.class)
                .satisfies(ex -> {
                    LoginRateLimitException rateEx = (LoginRateLimitException) ex;
                    assertThat(rateEx.getRetryAfterSeconds()).isBetween(298L, 300L);
                });

        LoginAttempt attempt = storage.get(ip + "#" + email);
        assertThat(attempt.getAttemptCount()).isEqualTo(5);
        assertThat(attempt.getBlockedUntil()).isEqualTo(clock.instant().plus(Duration.ofMinutes(5)));
    }

    @Test
    @DisplayName("recordFailure on attempt 10 should escalate block to 30 minutes (Tier 3)")
    void shouldEscalateToThirtyMinutesOnTenthAttempt() {
        String ip = "10.0.0.4";
        String email = "tier3@chronicles.com";

        // Fast-forward attempts to 9
        for (int i = 1; i <= 9; i++) {
            clock.advance(Duration.ofMinutes(10)); // past any intermediate block
            try {
                service.recordFailure(ip, email);
            } catch (LoginRateLimitException ignored) {}
        }

        clock.advance(Duration.ofMinutes(10));

        // Attempt 10: 30 minutes
        assertThatThrownBy(() -> service.recordFailure(ip, email))
                .isInstanceOf(LoginRateLimitException.class)
                .satisfies(ex -> {
                    LoginRateLimitException rateEx = (LoginRateLimitException) ex;
                    assertThat(rateEx.getRetryAfterSeconds()).isBetween(1798L, 1800L);
                });

        LoginAttempt attempt = storage.get(ip + "#" + email);
        assertThat(attempt.getAttemptCount()).isEqualTo(10);
        assertThat(attempt.getBlockedUntil()).isEqualTo(clock.instant().plus(Duration.ofMinutes(30)));
    }

    @Test
    @DisplayName("checkNotBlocked during active lockout throws exception and performs no additional repository saves")
    void shouldThrowWhenCheckingActiveBlockWithoutPerformingWrites() {
        String ip = "10.0.0.5";
        String email = "lockout@chronicles.com";

        // Reach 3 attempts
        service.recordFailure(ip, email);
        service.recordFailure(ip, email);
        try { service.recordFailure(ip, email); } catch (LoginRateLimitException ignored) {}

        reset(repository);
        when(repository.findByIpAddressAndIdentifier(anyString(), anyString())).thenAnswer(invocation -> {
            String i = invocation.getArgument(0);
            String id = invocation.getArgument(1);
            return Optional.ofNullable(storage.get(i + "#" + id));
        });

        // 30 seconds into the 60s block
        clock.advance(Duration.ofSeconds(30));

        assertThatThrownBy(() -> service.checkNotBlocked(ip, email))
                .isInstanceOf(LoginRateLimitException.class)
                .satisfies(ex -> {
                    LoginRateLimitException rateEx = (LoginRateLimitException) ex;
                    assertThat(rateEx.getRetryAfterSeconds()).isBetween(29L, 30L);
                });

        // Anti-escalation guarantee: checkNotBlocked must never write
        verify(repository, never()).save(any());
        assertThat(storage.get(ip + "#" + email).getAttemptCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("checkNotBlocked after lockout has expired should succeed without throwing")
    void shouldNotThrowWhenCheckingAfterBlockInstantPassed() {
        String ip = "10.0.0.6";
        String email = "expired@chronicles.com";

        service.recordFailure(ip, email);
        service.recordFailure(ip, email);
        try { service.recordFailure(ip, email); } catch (LoginRateLimitException ignored) {}

        // Advance time past the 60s lockout
        clock.advance(Duration.ofSeconds(70));

        // Checking does not throw
        service.checkNotBlocked(ip, email);
    }

    @Test
    @DisplayName("different IP addresses or identifiers are tracked in independent buckets")
    void shouldTreatDifferentIPsAndIdentifiersAsIndependentBuckets() {
        String ip1 = "10.0.0.7";
        String ip2 = "10.0.0.8";
        String email1 = "user1@chronicles.com";
        String email2 = "user2@chronicles.com";

        // Lock out ip1 + email1
        for (int i = 0; i < 3; i++) {
            try { service.recordFailure(ip1, email1); } catch (LoginRateLimitException ignored) {}
        }

        // ip1 + email1 is blocked
        assertThatThrownBy(() -> service.checkNotBlocked(ip1, email1))
                .isInstanceOf(LoginRateLimitException.class);

        // Same IP with different email is NOT blocked
        service.checkNotBlocked(ip1, email2);

        // Different IP with same email is NOT blocked
        service.checkNotBlocked(ip2, email1);
    }

    @Test
    @DisplayName("identifier casing and whitespace are normalized to the same bucket")
    void shouldNormalizeIdentifierCasingAndWhitespace() {
        String ip = "10.0.0.9";

        service.recordFailure(ip, " User@Chronicles.Com ");
        service.recordFailure(ip, "user@chronicles.com");

        assertThatThrownBy(() -> service.recordFailure(ip, "USER@CHRONICLES.COM"))
                .isInstanceOf(LoginRateLimitException.class);

        assertThat(storage.get(ip + "#user@chronicles.com").getAttemptCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("recordSuccess should delete the stored attempt row")
    void shouldDeleteRowWhenRecordingSuccess() {
        String ip = "10.0.0.10";
        String email = "success@chronicles.com";

        service.recordFailure(ip, email);
        service.recordFailure(ip, email);
        assertThat(storage.get(ip + "#" + email)).isNotNull();

        service.recordSuccess(ip, email);
        assertThat(storage.get(ip + "#" + email)).isNull();
    }
}
