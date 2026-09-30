package com.chronicles.scheduler;

import com.chronicles.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoginAttemptCleanupJob {

    public static final Duration RETENTION_WINDOW = Duration.ofDays(7);

    private final LoginAttemptRepository loginAttemptRepository;
    private final Clock clock;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupStaleAttempts() {
        Instant cutoff = clock.instant().minus(RETENTION_WINDOW);
        long deleted = loginAttemptRepository.deleteByLastAttemptAtBefore(cutoff);
        log.info("Limpeza de tentativas de login concluída: {} registros removidos anteriores a {}", deleted, cutoff);
    }
}
