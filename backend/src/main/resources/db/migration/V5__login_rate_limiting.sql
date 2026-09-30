-- =====================================================================
-- Chronicles RPG - Migration V5: Login Rate Limiting
-- Flyway Versioned Migration
-- =====================================================================

CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    attempt_count INT NOT NULL DEFAULT 1,
    blocked_until TIMESTAMPTZ,
    first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_login_attempts_ip_identifier UNIQUE (ip_address, identifier)
);

CREATE INDEX idx_login_attempts_last_attempt_at ON login_attempts (last_attempt_at);
