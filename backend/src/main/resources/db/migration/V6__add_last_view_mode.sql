-- =====================================================================
-- Chronicles RPG - Migration V2: Add Last View Mode
-- =====================================================================

ALTER TABLE users 
ADD COLUMN last_view_mode VARCHAR(20) NOT NULL DEFAULT 'PLAYER';

-- Ensure it only accepts 'PLAYER' or 'DM'
ALTER TABLE users 
ADD CONSTRAINT chk_users_last_view_mode CHECK (last_view_mode IN ('PLAYER', 'DM'));
