package com.chronicles.repository;

import com.chronicles.domain.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {

    Optional<LoginAttempt> findByIpAddressAndIdentifier(String ipAddress, String identifier);

    @Modifying
    @Transactional
    long deleteByLastAttemptAtBefore(Instant cutoff);
}
