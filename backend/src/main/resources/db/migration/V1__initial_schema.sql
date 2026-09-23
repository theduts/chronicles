-- =====================================================================
-- Chronicles RPG - Migration V1: Initial Database Schema
-- DBMS: PostgreSQL 16+
-- Flyway Versioned Migration
-- =====================================================================

-- Extensão para geração nativa de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. TABELA DE USUÁRIOS (users)
-- =====================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER' 
        CONSTRAINT chk_users_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));
CREATE INDEX idx_users_username ON users (username);

-- =====================================================================
-- 2. TABELA DE CAMPANHAS (campaigns)
-- =====================================================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dm_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    universe VARCHAR(100),       -- Ex: 'Medieval / Tormenta', 'Trevas', 'Cyberpunk', etc.
    current_act VARCHAR(100) DEFAULT 'Ato I',
    lore TEXT,
    illustration_url TEXT,       -- URL da imagem no MinIO
    
    -- Código alfanumérico para entrada dos jogadores na mesa
    invite_code VARCHAR(20) UNIQUE NOT NULL DEFAULT UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_dm_id ON campaigns(dm_id);
CREATE INDEX idx_campaigns_invite_code ON campaigns(invite_code);

-- =====================================================================
-- 3. JOGADORES DA CAMPANHA (campaign_players)
-- =====================================================================
CREATE TABLE campaign_players (
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (campaign_id, user_id)
);

CREATE INDEX idx_campaign_players_user_id ON campaign_players(user_id);

-- =====================================================================
-- 4. TABELA DE PERSONAGENS (characters)
-- =====================================================================
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NULL REFERENCES campaigns(id) ON DELETE SET NULL,
    
    -- Metadados rápidos para listagem em cards da dashboard
    name VARCHAR(120) NOT NULL,
    race VARCHAR(60),
    class_kit VARCHAR(80),
    current_level INTEGER NOT NULL DEFAULT 1 CONSTRAINT chk_char_level CHECK (current_level >= 1),
    xp INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_char_xp CHECK (xp >= 0),
    portrait_url TEXT,
    
    -- Sistema de aprovação do Mestre e controle de rollback
    is_pending_review BOOLEAN NOT NULL DEFAULT FALSE,
    proposed_sheet JSONB,         -- Ficha alterada aguardando validação do mestre
    sheet_last_level JSONB,       -- Snapshot do nível anterior para desfazer level up
    
    -- Ficha oficial em vigor (atributos, perícias, proteções, magias Daemon)
    sheet JSONB NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_campaign_id ON characters(campaign_id);
CREATE INDEX idx_characters_pending_review ON characters(campaign_id, is_pending_review) 
    WHERE is_pending_review = TRUE;
CREATE INDEX idx_characters_sheet ON characters USING gin (sheet);

-- =====================================================================
-- 5. TABELA DE NPCS DA CAMPANHA (campaign_npcs)
-- =====================================================================
CREATE TABLE campaign_npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    race VARCHAR(80),
    occupation VARCHAR(120),
    description TEXT,
    notes TEXT,                                -- Segredos e anotações privadas do mestre
    portrait_url TEXT,
    is_persona BOOLEAN NOT NULL DEFAULT FALSE, -- Visibilidade na tela /historia_campanha
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_npcs_campaign_id ON campaign_npcs(campaign_id);
CREATE INDEX idx_campaign_npcs_persona ON campaign_npcs(campaign_id, is_persona) 
    WHERE is_persona = TRUE;

-- =====================================================================
-- 6. BESTIÁRIO E CATÁLOGO DE CRIATURAS (bestiary_monsters)
-- =====================================================================
CREATE TABLE bestiary_monsters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL DEFAULT 'MONSTRO',
    
    -- Status diretos de combate
    pv INTEGER NOT NULL DEFAULT 1,
    ip INTEGER NOT NULL DEFAULT 0,
    movement VARCHAR(50),
    
    -- Atributos Daemon e Habilidades Especiais
    attributes JSONB NOT NULL,
    abilities JSONB DEFAULT '[]'::jsonb,
    
    portrait_url TEXT,
    is_official BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Garante escopo correto: ou é oficial sem campanha, ou é da campanha
    CONSTRAINT chk_bestiary_scope CHECK (
        (is_official = TRUE AND campaign_id IS NULL) OR 
        (is_official = FALSE AND campaign_id IS NOT NULL)
    )
);

CREATE INDEX idx_bestiary_campaign_id ON bestiary_monsters(campaign_id);
CREATE INDEX idx_bestiary_official ON bestiary_monsters(is_official) WHERE is_official = TRUE;
CREATE INDEX idx_bestiary_attributes ON bestiary_monsters USING gin (attributes);

-- =====================================================================
-- 7. ENCICLOPÉDIA DA CAMPANHA (campaign_lore)
-- =====================================================================
CREATE TABLE campaign_lore (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Categorias: 'galeria', 'deidade', 'faccao', 'local', 'mapa'
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Dados específicos de cada tipo
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_lore_cat ON campaign_lore(campaign_id, category);
CREATE INDEX idx_campaign_lore_visible ON campaign_lore(campaign_id, is_visible) 
    WHERE is_visible = TRUE;

-- =====================================================================
-- 8. DIÁRIO DE SESSÕES E CRÔNICAS (campaign_chronicles)
-- =====================================================================
CREATE TABLE campaign_chronicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    session_number INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(200) NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location VARCHAR(150),
    mission VARCHAR(255),
    illustration_url TEXT,
    narrative TEXT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_campaign_session_number UNIQUE (campaign_id, session_number)
);

CREATE INDEX idx_campaign_chronicles_camp_session ON campaign_chronicles(campaign_id, session_number ASC);
CREATE INDEX idx_campaign_chronicles_author ON campaign_chronicles(author_id);

-- =====================================================================
-- 9. MURAL DE CONTRATOS E MISSÕES (contracts)
-- =====================================================================
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(150) NOT NULL,
    description TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CONSTRAINT chk_contract_status CHECK (status IN ('AVAILABLE', 'IN_PROGRESS', 'COMPLETED')),
        
    has_reward BOOLEAN NOT NULL DEFAULT FALSE,
    reward_value INTEGER NULL CONSTRAINT chk_reward_value CHECK (reward_value >= 0),
    currency VARCHAR(10) NULL,      -- 'PO', 'PP', 'PB'
    reward_item TEXT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_campaign_id ON contracts(campaign_id);
CREATE INDEX idx_contracts_status ON contracts(campaign_id, status);

-- =====================================================================
-- 10. ANOTAÇÕES PESSOAIS E DE CAMPANHA (notes)
-- =====================================================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_campaign_id ON notes(campaign_id);

-- =====================================================================
-- 11. COMPÊNDIO DE REGRAS DO SISTEMA (system_rules)
-- =====================================================================
CREATE TABLE system_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_slug VARCHAR(50) NOT NULL DEFAULT 'daemon',
    
    -- Chaves: 'racas', 'aprimoramentos', 'pericias', 'itens', 'familiares', 'montaria', 'levelup', 'regras_jogo', etc.
    rule_key VARCHAR(60) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    
    data JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_system_rule_key UNIQUE (system_slug, rule_key)
);

CREATE UNIQUE INDEX idx_system_rules_lookup ON system_rules(system_slug, rule_key);
CREATE INDEX idx_system_rules_data ON system_rules USING gin (data);

-- =====================================================================
-- 12. FEEDBACKS DOS USUÁRIOS (feedbacks)
-- =====================================================================
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    
    feedback_type VARCHAR(30) NOT NULL DEFAULT 'SUGGESTION'
        CONSTRAINT chk_feedback_type CHECK (feedback_type IN ('BUG', 'SUGGESTION', 'COMPLIMENT', 'OTHER')),
        
    message TEXT NOT NULL,
    screenshot_url TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CONSTRAINT chk_feedback_status CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
        
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedbacks_status_date ON feedbacks(status, created_at DESC);
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);

-- =====================================================================
-- 13. CATÁLOGO DE MAGIAS E GRIMÓRIO (spells)
-- =====================================================================
CREATE TABLE spells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_slug VARCHAR(50) NOT NULL DEFAULT 'daemon',
    
    name VARCHAR(150) NOT NULL,
    school_or_focus VARCHAR(80),
    level INTEGER NULL,
    
    description TEXT,
    data JSONB NOT NULL,
    
    is_official BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spells_system_name ON spells(system_slug, name);
CREATE INDEX idx_spells_system_school ON spells(system_slug, school_or_focus);
CREATE INDEX idx_spells_official ON spells(system_slug, is_official) WHERE is_official = TRUE;
CREATE INDEX idx_spells_data ON spells USING gin (data);
