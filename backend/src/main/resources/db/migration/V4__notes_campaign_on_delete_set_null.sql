-- =====================================================================
-- Chronicles RPG - Migration V4: Notes Campaign ON DELETE SET NULL
-- Flyway Versioned Migration
-- =====================================================================

ALTER TABLE notes 
    DROP CONSTRAINT IF EXISTS notes_campaign_id_fkey,
    ADD CONSTRAINT notes_campaign_id_fkey 
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
