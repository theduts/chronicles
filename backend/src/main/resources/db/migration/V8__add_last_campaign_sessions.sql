-- Última campanha ativa por modo de visualização (Mestre / Jogador)
ALTER TABLE users
ADD COLUMN last_campaign_dm_session UUID NULL REFERENCES campaigns(id) ON DELETE SET NULL,
ADD COLUMN last_campaign_player_session UUID NULL REFERENCES campaigns(id) ON DELETE SET NULL;
