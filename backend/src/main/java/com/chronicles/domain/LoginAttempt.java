package com.chronicles.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "login_attempts",
    uniqueConstraints = @UniqueConstraint(name = "uq_login_attempts_ip_identifier", columnNames = {"ip_address", "identifier"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(nullable = false, length = 255)
    private String identifier;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "blocked_until")
    private Instant blockedUntil;

    @CreationTimestamp
    @Column(name = "first_attempt_at", nullable = false, updatable = false)
    private Instant firstAttemptAt;

    @UpdateTimestamp
    @Column(name = "last_attempt_at", nullable = false)
    private Instant lastAttemptAt;
}
