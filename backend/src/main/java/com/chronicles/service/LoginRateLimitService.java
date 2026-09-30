package com.chronicles.service;

import com.chronicles.domain.LoginAttempt;
import com.chronicles.exception.LoginRateLimitException;
import com.chronicles.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LoginRateLimitService {

    public static final int TIER_1_ATTEMPTS = 3;
    public static final Duration TIER_1_DURATION = Duration.ofMinutes(1);

    public static final int TIER_2_ATTEMPTS = 5;
    public static final Duration TIER_2_DURATION = Duration.ofMinutes(5);

    public static final int TIER_3_ATTEMPTS = 10;
    public static final Duration TIER_3_DURATION = Duration.ofMinutes(30);

    private final LoginAttemptRepository loginAttemptRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public void checkNotBlocked(String ipAddress, String identifier) {
        String normIdentifier = normalizeIdentifier(identifier);
        loginAttemptRepository.findByIpAddressAndIdentifier(ipAddress, normIdentifier).ifPresent(attempt -> {
            if (attempt.getBlockedUntil() != null) {
                Instant now = clock.instant();
                if (attempt.getBlockedUntil().isAfter(now)) {
                    long remainingSeconds = Math.max(1L, (long) Math.ceil((attempt.getBlockedUntil().toEpochMilli() - now.toEpochMilli()) / 1000.0));
                    throw new LoginRateLimitException(remainingSeconds);
                }
            }
        });
    }

    @Transactional
    public void recordFailure(String ipAddress, String identifier) {
        String normIdentifier = normalizeIdentifier(identifier);
        Instant now = clock.instant();

        LoginAttempt attempt = loginAttemptRepository.findByIpAddressAndIdentifier(ipAddress, normIdentifier)
                .orElseGet(() -> LoginAttempt.builder()
                        .ipAddress(ipAddress)
                        .identifier(normIdentifier)
                        .attemptCount(0)
                        .firstAttemptAt(now)
                        .build());

        int newCount = attempt.getAttemptCount() + 1;
        attempt.setAttemptCount(newCount);
        attempt.setLastAttemptAt(now);

        Instant blockUntil = computeBlockUntil(newCount, now);
        if (blockUntil != null) {
            attempt.setBlockedUntil(blockUntil);
            loginAttemptRepository.save(attempt);
            long retryAfter = Math.max(1L, Duration.between(now, blockUntil).toSeconds());
            throw new LoginRateLimitException(retryAfter);
        } else {
            loginAttemptRepository.save(attempt);
        }
    }

    @Transactional
    public void recordSuccess(String ipAddress, String identifier) {
        String normIdentifier = normalizeIdentifier(identifier);
        loginAttemptRepository.findByIpAddressAndIdentifier(ipAddress, normIdentifier)
                .ifPresent(loginAttemptRepository::delete);
    }

    private Instant computeBlockUntil(int attemptCount, Instant now) {
        if (attemptCount >= TIER_3_ATTEMPTS) {
            return now.plus(TIER_3_DURATION);
        } else if (attemptCount >= TIER_2_ATTEMPTS) {
            return now.plus(TIER_2_DURATION);
        } else if (attemptCount >= TIER_1_ATTEMPTS) {
            return now.plus(TIER_1_DURATION);
        }
        return null;
    }

    private String normalizeIdentifier(String identifier) {
        if (identifier == null) {
            return "";
        }
        return identifier.trim().toLowerCase(Locale.ROOT);
    }
}
