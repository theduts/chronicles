-- =====================================================================
-- Chronicles RPG - Migration V10: Ajusta o rótulo do aprimoramento Familiares
-- O livro (Cap. 6) restringe Familiares a quem possui Poderes Mágicos,
-- e não a "conjuradores" em geral.
-- =====================================================================

UPDATE system_rules
SET data = jsonb_set(data, '{familiares,nome}', '"Familiares (Requer Poderes Mágicos)"'::jsonb),
    updated_at = CURRENT_TIMESTAMP
WHERE system_slug = 'daemon'
  AND rule_key = 'aprimoramentos'
  AND data -> 'familiares' ->> 'nome' = 'Familiares (Apenas Conjuradores)';
