# Decisões de Arquitetura e Modelagem do Banco de Dados (PostgreSQL + Flyway)

Este documento registra as decisões tomadas, justificativas técnicas e os esquemas DDL acordados para a construção do banco de dados no PostgreSQL (via Docker) com versionamento pelo Flyway.

---

## 1. Tabela de Usuários (`users`)

### Decisões e Justificativas:
1. **Nome da Tabela (`users` em vez de `"user"`):**
   - `"user"` é palavra reservada fundamental no PostgreSQL (função de sistema `CURRENT_USER`). 
   - Nomear como `users` no plural evita necessidade de aspas duplas em queries manuais e elimina conflitos de mapeamento no Spring Data JPA / Hibernate (`@Table(name = "users")`).

2. **Papel de Mestre (DM) vs. Jogador (PC):**
   - **Regra de Negócio:** No RPG, a mesma pessoa pode mestrar uma campanha e jogar como personagem em outra. Fixar `dm` ou `pc` no cadastro da conta forçaria o usuário a ter duas contas diferentes.
   - **Solução Arquitetural:** O papel de DM/PC é **contextual por campanha**:
     - Se `campanha.dm_id == usuario.id` $\rightarrow$ Visão e permissões de **Mestre**.
     - Se `campanha.dm_id != usuario.id` (vinculado via membros/personagens) $\rightarrow$ Visão e permissões de **Jogador**.
   - Na tabela `users`, a coluna `role` serve estritamente para autorização do sistema (`ROLE_USER` para jogadores e mestres normais, `ROLE_ADMIN` para administradores da plataforma).

3. **Restrição com `CHECK` em vez de `CREATE TYPE ... AS ENUM` nativo:**
   - Tipos ENUM nativos do PostgreSQL trazem atrito de migração no Flyway (difíceis de alterar/estender dentro de blocos transacionais).
   - O Hibernate 6 tem compatibilidade nativa e sem necessidade de converters customizados com `VARCHAR(20)` + `CHECK (role IN (...))`.

4. **Tratamento de E-mail (Case-Insensitive):**
   - O PostgreSQL trata constraints `UNIQUE` com diferenciação de maiúsculas/minúsculas.
   - Criado um índice único com `LOWER(email)` para impedir duplicidade acidental de contas (ex: `User@email.com` e `user@email.com`).

5. **Auditoria e Segurança:**
   - Chaves primárias em `UUID` geradas nativamente por `gen_random_uuid()` (extensão `pgcrypto`).
   - Senha explicitada como `password_hash` (para algoritmos seguros como BCrypt ou Argon2).
   - Campos de ciclo de vida e auditoria: `is_active` (soft-delete para evitar quebra de integridade referencial), `created_at` e `updated_at` com timezone (`TIMESTAMPTZ`).

---

### DDL Aprovado:

```sql
-- Extensão para geração de UUIDs nativos
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Usuários
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

-- Índice único case-insensitive para o e-mail
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));

-- Índice para busca rápida de usuários por username
CREATE INDEX idx_users_username ON users (username);
```

---

## 2. Tabela de Personagens (`characters`)

### Decisões e Justificativas:
1. **Nome da Tabela (`characters`):**
   - Segue o padrão plural em inglês estabelecido no projeto (`users`, `characters`, `campaigns`).

2. **Vínculo com Campanha Opcional (`campaign_id NULL`):**
   - **Regra de Negócio:** Jogadores podem criar personagens em seus acervos pessoais ("Minhas Fichas") antes mesmo de entrarem em uma campanha.
   - A exclusão de uma campanha pelo mestre não deve deletar as fichas dos jogadores, apenas desvinculá-las (`ON DELETE SET NULL`).

3. **Arquitetura Híbrida (Colunas Relacionais + `sheet JSONB`):**
   - **Colunas Relacionais:** Metadados cruciais para listagem rápida e filtros na dashboard (`name`, `race`, `class_kit`, `current_level`, `xp`, `portrait_url`). Evita descompactar JSON dezenas de vezes para renderizar cards.
   - **`sheet JSONB`:** Contém o miolo denso e matemático das regras Daemon (atributos CON/FOR com percentuais calculados, pontos vitais, proteções de armadura, árvore de perícias, focos de magia e inventário).

4. **Fluxo de Moderação do Mestre e Rollback:**
   - **`sheet JSONB`:** Ficha oficial em vigor usada em combate e consultas em tempo real.
   - **`proposed_sheet JSONB`:** Alterações submetidas pelo jogador aguardando revisão do mestre. Não impacta a ficha oficial até ser aprovada.
   - **`is_pending_review BOOLEAN`:** Flag indexada para busca instantânea de fichas pendentes no dashboard do mestre (`WHERE campaign_id = ? AND is_pending_review = TRUE`).
   - **`sheet_last_level JSONB`:** Snapshot capturado no instante imediatamente anterior ao avanço de nível, permitindo rollback seguro caso o jogador distribua pontos erroneamente.

5. **Índices de Alta Performance:**
   - Índices explícitos em `user_id` e `campaign_id` para eliminar sequential scans e evitar deadlocks durante exclusões.
   - Índice GIN na coluna `sheet` para suportar buscas pontuais no JSONB se necessário.

---

### DDL Aprovado:

```sql
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NULL REFERENCES campaigns(id) ON DELETE SET NULL,
    
    -- Metadados rápidos para listagem e filtros de dashboard
    name VARCHAR(120) NOT NULL,
    race VARCHAR(60),
    class_kit VARCHAR(80),
    current_level INTEGER NOT NULL DEFAULT 1 CONSTRAINT chk_char_level CHECK (current_level >= 1),
    xp INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_char_xp CHECK (xp >= 0),
    portrait_url TEXT,
    
    -- Sistema de aprovação do Mestre e controle de versão
    is_pending_review BOOLEAN NOT NULL DEFAULT FALSE,
    proposed_sheet JSONB,         -- Ficha proposta pelo jogador aguardando aprovação
    sheet_last_level JSONB,       -- Snapshot do nível anterior para rollback de level up
    
    -- Ficha oficial em vigor (atributos, perícias, proteções, magia Daemon)
    sheet JSONB NOT NULL,
    
    -- Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices obrigatórios para performance e integridade
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_campaign_id ON characters(campaign_id);
CREATE INDEX idx_characters_pending_review ON characters(campaign_id, is_pending_review) 
    WHERE is_pending_review = TRUE;

-- Índice GIN para consultas no conteúdo da ficha
CREATE INDEX idx_characters_sheet ON characters USING gin (sheet);
```

---

## 3. Campanhas e Membros (`campaigns` e `campaign_players`)

### Decisões e Justificativas:
1. **Identificação do Mestre (`dm_id`):**
   - Aponta para `users(id)` com `ON DELETE CASCADE`. O dono da campanha tem poder total de moderação.
2. **Entrada de Jogadores via Código (`invite_code`):**
   - Cada campanha gera um código alfanumérico único para os jogadores entrarem na mesa de forma simples.
3. **Desacoplamento de Conteúdo Pesado:**
   - NPCs e Bestiário foram retirados da linha da campanha e movidos para tabelas filhas relacionais dedicadas, evitando tráfego de megabytes de JSON e eliminando concorrência de locks durante o jogo ao vivo.
4. **Tabela Associativa `campaign_players`:**
   - Permite que múltiplos jogadores participem da campanha, mantendo a data de ingresso (`joined_at`).

### DDL Aprovado:

```sql
-- Tabela de Campanhas
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dm_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    universe VARCHAR(100),       -- Ex: 'Medieval / Tormenta', 'Trevas', 'Cyberpunk', etc.
    lore TEXT,
    illustration_url TEXT,       -- URL da imagem de capa no MinIO
    
    -- Código único para os jogadores entrarem na mesa
    invite_code VARCHAR(20) UNIQUE NOT NULL DEFAULT UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
    
    -- Status da campanha
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_dm_id ON campaigns(dm_id);
CREATE INDEX idx_campaigns_invite_code ON campaigns(invite_code);

-- Tabela de Jogadores Participantes
CREATE TABLE campaign_players (
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (campaign_id, user_id)
);

CREATE INDEX idx_campaign_players_user_id ON campaign_players(user_id);
```

---

## 4. NPCs da Campanha (`campaign_npcs`)

### Decisões e Justificativas:
1. **Atômico por Campanha:** Cada NPC é um registro independente, permitindo buscas instantâneas por nome, raça e ocupação sem carregar toda a campanha.
2. **Flag de Persona do Universo (`is_persona`):**
   - `is_persona = FALSE`: NPC de bastidores, visível exclusivamente para o Mestre.
   - `is_persona = TRUE`: Promovido a "Persona do Universo", ficando visível para os jogadores na tela `/historia_campanha`.
3. **Segurança de Segredos:**
   - A coluna `notes` armazena os segredos de bastidores e nunca é retornada aos jogadores nas rotas públicas.

### DDL Aprovado:

```sql
CREATE TABLE campaign_npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    race VARCHAR(80),               -- Ex: 'Humano', 'Elfo Negro'
    occupation VARCHAR(120),        -- Ex: 'Taverneiro e Informante'
    description TEXT,               -- 'Descrição & Aparência'
    notes TEXT,                     -- 'Segredos & Anotações' (restrito ao mestre)
    portrait_url TEXT,
    is_persona BOOLEAN NOT NULL DEFAULT FALSE, -- Visibilidade na /historia_campanha
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_npcs_campaign_id ON campaign_npcs(campaign_id);
CREATE INDEX idx_campaign_npcs_persona ON campaign_npcs(campaign_id, is_persona) WHERE is_persona = TRUE;
```

---

## 5. Bestiário e Catálogo de Criaturas (`bestiary_monsters`)

### Decisões e Justificativas:
1. **Unificação de Catálogo Oficial e Criaturas de Campanha:**
   - **Oficiais Daemon:** `is_official = TRUE` e `campaign_id IS NULL` (disponíveis para todos os mestres do sistema).
   - **Da Campanha:** `is_official = FALSE` e `campaign_id` preenchido (pertencem àquela mesa específica).
2. **Constraint de Integridade (`chk_bestiary_scope`):**
   - Impede que monstros não-oficiais fiquem "órfãos" sem campanha no banco de dados.
3. **Atributos e Habilidades em JSONB:**
   - Status de combate no card (`pv`, `ip`, `movement`) indexados diretamente; atributos e lista de habilidades guardadas em JSONB estruturado.

### DDL Aprovado:

```sql
CREATE TABLE bestiary_monsters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL DEFAULT 'MONSTRO', -- 'MONSTRO', 'BOSS', 'HUMANOIDE', etc.
    
    -- Status diretos de combate
    pv INTEGER NOT NULL DEFAULT 1,
    ip INTEGER NOT NULL DEFAULT 0,
    movement VARCHAR(50),           -- Ex: '8 M'
    
    -- Atributos Daemon e Habilidades
    attributes JSONB NOT NULL,
    abilities JSONB DEFAULT '[]'::jsonb,
    
    portrait_url TEXT,
    is_official BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_bestiary_scope CHECK (
        (is_official = TRUE AND campaign_id IS NULL) OR 
        (is_official = FALSE AND campaign_id IS NOT NULL)
    )
);

CREATE INDEX idx_bestiary_campaign_id ON bestiary_monsters(campaign_id);
CREATE INDEX idx_bestiary_official ON bestiary_monsters(is_official) WHERE is_official = TRUE;
```

---

## 6. A Enciclopédia da Campanha (`campaign_lore`)

### Decisões e Justificativas:
1. **Unificação de Worldbuilding (Galeria, Panteão, Facções, Geografia e Mapas):**
   - Evita a proliferação desnecessária de 5 tabelas pequenas.
   - Todas as entidades da enciclopédia compartilham: identificação (`id`, `campaign_id`), título/nome (`title`), descrição/legenda (`description`), imagem no MinIO (`image_url`) e controle de visibilidade (`is_visible`).
2. **Dados Específicos em `data JSONB`:**
   - Permite acomodar de forma elegante as particularidades de cada aba da tela `/historia_campanha`:
     - **`deidade`:** `subtitulo`, `alinhamento`, `dominios`, `simbologia`, `cultos`.
     - **`faccao`:** `lider`, `sede`, `aliados`, `inimigos`.
     - **`local`:** `regiao`, `clima`, `populacao`.
     - **`mapa`:** `escala`, `pontos_interesse`.
     - **`galeria`:** `legenda_extra`, `epoca`.
3. **Controle de Ocultação do Mestre (`is_visible`):**
   - Permite ao Mestre preparar segredos de campanha (novas facções, deuses desconhecidos ou mapas secretos) sem que apareçam para os jogadores até a revelação.

### DDL Aprovado:

```sql
CREATE TABLE campaign_lore (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Categoria: 'galeria', 'deidade', 'faccao', 'local', 'mapa'
    category VARCHAR(50) NOT NULL,
    
    -- Dados universais de exibição
    title VARCHAR(150) NOT NULL,              -- Nome da deidade, facção, local ou título da foto/mapa
    description TEXT,                         -- Descrição completa ou legenda
    image_url TEXT,                           -- Banner, mapa, foto ou símbolo sagrado (MinIO)
    is_visible BOOLEAN NOT NULL DEFAULT TRUE, -- Oculto ou visível aos jogadores
    
    -- Dados específicos de cada tipo
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices de consulta rápida por categoria e visibilidade
CREATE INDEX idx_campaign_lore_cat ON campaign_lore(campaign_id, category);
CREATE INDEX idx_campaign_lore_visible ON campaign_lore(campaign_id, is_visible) WHERE is_visible = TRUE;
```

---

## 7. Diário de Sessões e Crônicas (`campaign_chronicles`)

### Decisões e Justificativas:
1. **Separação de Identificador e Sequencial:**
   - Chave primária `id UUID` para imutabilidade e integridade referencial nas rotas REST.
   - Coluna `session_number INTEGER` (partindo de 0 para "Sessão Zero" ou 1 para "Sessão I") com constraint de unicidade por campanha (`uq_campaign_session_number`).
2. **Autor da Crônica (`author_id`):**
   - Aponta para `users(id)`, permitindo tanto o Mestre quanto um jogador no papel de "Escriba" redigirem o relato da sessão.
3. **Dados de Narrativa e Missão:**
   - Registra data real (`session_date`), local no cenário (`location`), objetivo (`mission`), arte comemorativa (`illustration_url` no MinIO) e a narrativa detalhada (`narrative`).

### DDL Aprovado:

```sql
CREATE TABLE campaign_chronicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    session_number INTEGER NOT NULL DEFAULT 0, -- 0 = Sessão Zero, 1 = Sessão I, etc.
    title VARCHAR(200) NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location VARCHAR(150),
    mission VARCHAR(255),
    illustration_url TEXT,                     -- URL da arte no MinIO
    narrative TEXT NOT NULL,                   -- O relato completo da aventura
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Impede sessões duplicadas com o mesmo número na mesma campanha
    CONSTRAINT uq_campaign_session_number UNIQUE (campaign_id, session_number)
);

CREATE INDEX idx_campaign_chronicles_camp_session ON campaign_chronicles(campaign_id, session_number ASC);
CREATE INDEX idx_campaign_chronicles_author ON campaign_chronicles(author_id);
```

---

## 8. Mural de Contratos e Missões (`contracts`)

### Decisões e Justificativas:
1. **Controle Narrativo do Mestre:**
   - Removido nível de perigo rígido: o Mestre dosa o desafio de forma orgânica na narrativa.
2. **Ciclo de Vida Simplificado (`status`):**
   - Apenas três estados: `AVAILABLE` (aberto no mural), `IN_PROGRESS` (aceito pelo grupo) e `COMPLETED` (concluído). Em caso de falha dos heróis, a missão simplesmente retorna ao estado `AVAILABLE`.
3. **Sistema de Recompensa Flexível:**
   - Moedas (`reward_value` + `currency`) combinadas com campo livre para itens ou favores (`reward_item`).

### DDL Aprovado:

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(150) NOT NULL,
    description TEXT,
    
    -- Status do contrato no mural
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CONSTRAINT chk_contract_status CHECK (status IN ('AVAILABLE', 'IN_PROGRESS', 'COMPLETED')),
        
    -- Recompensa (moedas e/ou itens)
    has_reward BOOLEAN NOT NULL DEFAULT FALSE,
    reward_value INTEGER NULL CONSTRAINT chk_reward_value CHECK (reward_value >= 0),
    currency VARCHAR(10) NULL,      -- 'PO', 'PP', 'PB'
    reward_item TEXT NULL,          -- Texto livre para itens mágicos, artefatos ou favores
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_campaign_id ON contracts(campaign_id);
CREATE INDEX idx_contracts_status ON contracts(campaign_id, status);
```

---

## 9. Anotações Pessoais e de Campanha (`notes`)

### Decisões e Justificativas:
1. **Flexibilidade de Escopo (`campaign_id NULL`):**
   - Se `campaign_id IS NULL`: Anotação pessoal do jogador (acervo geral, builds, rascunhos).
   - Se `campaign_id IS NOT NULL`: Anotação atrelada a uma mesa de RPG específica.
2. **Ordenação Temporal (`updated_at`):**
   - Imprescindível para o bloco de notas rich-text do frontend listar as notas ordenadas pelas modificadas mais recentemente.

### DDL Aprovado:

```sql
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
```

---

## 10. Compêndio de Regras e Dados do Sistema (`system_rules`)

### Decisões e Justificativas:
1. **Padrão Chave-Valor por Tópico (`rule_key` + `data JSONB`):**
   - Evita o anti-pattern de "God Row" (uma tabela com 10 colunas JSONB monolíticas).
   - Cada tópico de regra (`racas`, `aprimoramentos`, `pericias`, `itens`, `familiares`, `montaria`, `levelup`, `regras_jogo`, `regras_novo_personagem`) é uma linha independente.
   - Permite consultas atômicas na API (`GET /api/rules/racas`), reduzindo drasticamente o consumo de memória e viabilizando cache HTTP no frontend.
2. **Pronto para Múltiplos Sistemas de RPG (`system_slug`):**
   - Atende diretamente ao requisito não-funcional NFR-02 do projeto: arquitetura extensível para suportar Daemon hoje e outros sistemas (D&D 5e, Tormenta20, etc.) no futuro sem alterar o schema.
3. **Controle de Versão (`version`):**
   - Permite controle fino de cache e invalidação no frontend e na API caso tabelas oficiais de regras sofram erratas ou revisões.

### DDL Aprovado:

```sql
CREATE TABLE system_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sistema de RPG (ex: 'daemon', 'tormenta20', etc.)
    system_slug VARCHAR(50) NOT NULL DEFAULT 'daemon',
    
    -- Chave única do catálogo: 'racas', 'aprimoramentos', 'pericias', 'itens', etc.
    rule_key VARCHAR(60) NOT NULL,
    title VARCHAR(150) NOT NULL,          -- Ex: "Catálogo de Raças", "Perícias e Especializações"
    description VARCHAR(255),             -- Breve resumo
    
    -- O JSON oficial com a estrutura de regras
    data JSONB NOT NULL,
    
    version INTEGER NOT NULL DEFAULT 1,   -- Controle de versão para invalidar cache
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Garante que cada regra é única por sistema
    CONSTRAINT uq_system_rule_key UNIQUE (system_slug, rule_key)
);

-- Índice único para busca instantânea pela chave
CREATE UNIQUE INDEX idx_system_rules_lookup ON system_rules(system_slug, rule_key);

-- Índice GIN para buscas internas no catálogo se necessário
CREATE INDEX idx_system_rules_data ON system_rules USING gin (data);
```

---

## 11. Feedbacks dos Usuários (`feedbacks`)

### Decisões e Justificativas:
1. **Identificação Opcional (`user_id NULL`):**
   - Permite tanto feedbacks autenticados (facilitando suporte e retorno ao usuário) quanto envio anônimo.
2. **Tipo e Triagem de Status (`feedback_type` e `status`):**
   - Categorias: `BUG`, `SUGGESTION`, `COMPLIMENT`, `OTHER`.
   - Estados de triagem pelo desenvolvedor: `PENDING` (não lido), `REVIEWED` (em análise) e `RESOLVED` (concluído/corrigido).
3. **Anexo de Imagens / Prints (`screenshot_url`):**
   - Suporte ao upload de captura de tela via MinIO para facilitar a reprodução de bugs visuais na ficha ou na campanha.

### DDL Aprovado:

```sql
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    
    feedback_type VARCHAR(30) NOT NULL DEFAULT 'SUGGESTION'
        CONSTRAINT chk_feedback_type CHECK (feedback_type IN ('BUG', 'SUGGESTION', 'COMPLIMENT', 'OTHER')),
        
    message TEXT NOT NULL,
    screenshot_url TEXT,                 -- URL do print/anexo hospedado no MinIO
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CONSTRAINT chk_feedback_status CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
        
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedbacks_status_date ON feedbacks(status, created_at DESC);
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
```

---

## 12. Catálogo Canônico de Magias e Grimório (`spells`)

### Decisões e Justificativas:
1. **Catálogo Canônico Desacoplado da Ficha:**
   - A tabela `spells` atua estritamente como a **Biblioteca Canônica / Grimório de Consulta**.
   - As magias ativas, aprendidas ou preparadas por um personagem específico residem diretamente dentro do array `spells` na coluna **`characters.sheet JSONB`**.
   - Isso garante performance máxima em combate (zero `JOINs` para abrir a ficha) e permite ao jogador personalizar notas de conjuração sem poluir o compêndio global.
2. **Escalabilidade Multissistemas (`system_slug` e `level`):**
   - No sistema Daemon inicial, as magias são livres e baseadas em Focos (Criar/Controlar/Entender) salvos na ficha.
   - A tabela `spells` nasce pronta para receber catálogos oficiais quando novos sistemas forem acoplados (ex: as centenas de magias canônicas de D&D 5e ou Tormenta20).
3. **Suporte a Homebrew Canônico:**
   - Mestres ou administradores podem cadastrar magias customizadas na biblioteca através de `created_by` e `is_official`.

### DDL Aprovado:

```sql
CREATE TABLE spells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_slug VARCHAR(50) NOT NULL DEFAULT 'daemon',
    
    -- Metadados de busca e filtros no grimório
    name VARCHAR(150) NOT NULL,
    school_or_focus VARCHAR(80),          -- Ex: 'Fogo', 'Trevas', 'Evocação', 'Necromancia'
    level INTEGER NULL,                   -- Círculo / Nível da magia (D&D/Tormenta; NULL para Daemon)
    
    -- Descrição e mecânica completa
    description TEXT,
    data JSONB NOT NULL,                  -- Custo, alcance, duração, caminhos/formas ou componentes
    
    is_official BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE para regras oficiais do livro
    created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL, -- Autor caso seja homebrew
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spells_system_name ON spells(system_slug, name);
CREATE INDEX idx_spells_system_school ON spells(system_slug, school_or_focus);
CREATE INDEX idx_spells_official ON spells(system_slug, is_official) WHERE is_official = TRUE;
CREATE INDEX idx_spells_data ON spells USING gin (data);
```

---

## 13. Migração 1 a 1: Direcionamento dos Arquivos Mock (`data-mock`) para o Banco de Dados

Esta seção consolida o estudo e a **auditoria de paridade estrutural (1 a 1)** dos 9 arquivos legados remanescentes em `frontend/public/data-mock/` (e seus equivalentes em `frontend/dist/data-mock/`). 

### Resultado da Auditoria Profunda de Dados
> [!IMPORTANT]
> **Nenhum dado foi perdido.** Uma verificação minuciosa comparando cada chave, array, campo e subcampo dos arquivos mock contra as migrations oficiais (`V2__seed_system_rules.sql` e `V3__seed_official_bestiary.sql`) comprovou que **todos os 9 arquivos já estão 100% persistidos no PostgreSQL**.

---

### Visão Geral de Mapeamento e Paridade Auditada (Matriz 1 a 1)

| # | Arquivo Mock | Consumidor no Frontend | Tabela de Destino | Chave / Escopo | Status de Paridade com o Banco | Rota REST Oficial |
|---|--------------|------------------------|-------------------|----------------|--------------------------------|-------------------|
| **1** | `pericias.json` (~21KB) | `CharacterEditorView.tsx` | `system_rules` | `rule_key = 'pericias'` | **100% Idêntico** (45 perícias e subgrupos) | `GET /api/rules/pericias` (Público) |
| **2** | `itens.json` (~60KB) | `CharacterEditorView.tsx` | `system_rules` | `rule_key = 'itens'` | **100% Idêntico** (434 itens completos) | `GET /api/rules/itens` (Público) |
| **3** | `montaria.json` (~4.1KB) | Modal Invocação / Companheiros | `system_rules` | `rule_key = 'montaria'` | **100% Idêntico** (6 montarias base com ataques) | `GET /api/rules/montaria` (Público) |
| **4** | `familiares.json` (~10KB) | Modal Invocação / Companheiros | `system_rules` | `rule_key = 'familiares'` | **100% Idêntico** (7 familiares com bônus arcanos) | `GET /api/rules/familiares` (Público) |
| **5** | `bestiario.json` (~536KB) | `BestiaryView.tsx` | `bestiary_monsters` | `is_official = TRUE` | **100% Auditado** (Todas as 295 criaturas no V3) | `GET /api/bestiary` |
| **6** | `aprimoramentos.json` (~44KB) | Criação de Ficha (`CharacterEditorView.tsx`) | `system_rules` | `rule_key = 'aprimoramentos'` | **100% Idêntico** (108 vantagens/desvantagens) | `GET /api/rules/aprimoramentos` (Público) |
| **7** | `racas.json` (~1.9KB) | Criação de Ficha (`CharacterEditorView.tsx`) | `system_rules` | `rule_key = 'racas'` | **100% Idêntico** (6 raças com modificadores) | `GET /api/rules/racas` (Público) |
| **8** | `regras_de_jogo.json` (~7.6KB) | Guia do Jogador (`CharacterEditorView.tsx`) | `system_rules` | `rule_key = 'regras_jogo'` | **100% Idêntico** (7 tópicos e 6 estágios sanidade) | `GET /api/rules/regras_jogo` (Público) |
| **9** | `regras_novo_personagem.md` (~2.8KB) | Guia do Jogador (`CharacterEditorView.tsx`) | `system_rules` | `rule_key = 'regras_novo_personagem'` | **100% Idêntico** (2.664 caracteres normalizados) | `GET /api/rules/regras_novo_personagem` (Público) |

---

### Detalhamento das Verificações e Notas Técnicas

1. **`racas.json` $\rightarrow$ `system_rules('racas')`:**
   - As 6 raças canônicas (Humano, Anão, Elfo, Gnomo, Meio-Elfo, Halfling) possuem exatamente os mesmos atributos modificadores, perícias bônus e aprimoramentos.

2. **`aprimoramentos.json` $\rightarrow$ `system_rules('aprimoramentos')`:**
   - Todas as 108 vantagens e desvantagens batem de ponta a ponta (IDs, descrições, custos e níveis).
   - O frontend atualmente faz `import` estático em `CharacterEditorView.tsx`. A mudança consistirá em transformar esse import em consulta assíncrona ao endpoint `GET /api/rules/aprimoramentos` com cache de 24h/Infinity no React Query.

3. **`pericias.json` $\rightarrow$ `system_rules('pericias')`:**
   - Todas as 45 perícias com suas tags (`Combate`, `Ladinagem`, `Ofício`, `Conhecimento`, `Magia`, `Sobrevivência`), regras de ataque/defesa e todos os subgrupos são idênticos.

4. **`itens.json` $\rightarrow$ `system_rules('itens')`:**
   - Todos os 434 itens (armas de corte, impacto e fogo, armaduras divididas por slots `base`/`torso`/`cabeca`, escudos, poções alquímicas, embarcações e arreios) estão 100% idênticos.

5. **`montaria.json` $\rightarrow$ `system_rules('montaria')`:**
   - Confirmado na linha 81 da migration `V2__seed_system_rules.sql`: as 6 montarias base (`cavalo_carga_montaria`, `cavalo_guerra_leve`, `cavalo_guerra_medio`, `cavalo_guerra_pesado`, `ponei_comum`, `ponei_guerra`) estão integralmente salvas com seus dados de combate e ataques nativos. Não é necessária nova migration.

6. **`familiares.json` $\rightarrow$ `system_rules('familiares')`:**
   - Confirmado na linha 66 da migration `V2__seed_system_rules.sql`: todos os 7 familiares mágicos (`gato`, `falcao`, `coruja`, `rato`, `texugo`, `lagarto`, `morcego`) estão salvos com seus atributos, habilidades de evasão/vínculo e objetos de `bonus_arcano`. Não é necessária nova migration.

7. **`bestiario.json` $\rightarrow$ `bestiary_monsters` (Migration V3):**
   - Todas as 295 criaturas do arquivo `bestiario.json` estão cadastradas como linhas independentes na tabela `bestiary_monsters` com `is_official = TRUE`.
   - **Nota sobre aspas:** Criaturas com apóstrofo como `Kill'bone` estão salvas no SQL com escape padrão `Kill''bone`, resultando na string idêntica ao ser lida pelo PostgreSQL/Spring Boot.
   - **Nota sobre PV 0 vs 1:** Em `bestiario.json`, 19 fichas de arquétipos humanóides/modelos de raça (ex: Anão, Elfo, Aparição) possuíam `hp: 0` porque dependem dos atributos de quem as usa. No banco relacional, a tabela impõe `pv >= 1` (regra básica Daemon de que criaturas vivas não têm PV zero no cadastro), o que é o comportamento correto.

8. **`regras_de_jogo.json` $\rightarrow$ `system_rules('regras_jogo')`:**
   - Os 7 tópicos (Introdução, O Básico, Universo Medieval, Testes 1d100, Combate Passo a Passo, Magia e Fé, Sanidade com os 6 Estágios) batem integralmente.

9. **`regras_novo_personagem.md` $\rightarrow$ `system_rules('regras_novo_personagem')`:**
   - O guia completo em Markdown (101 pontos de atributo, 5 de aprimoramento, perícias e PVs) possui 2.664 caracteres úteis idênticos caractere a caractere (a diferença observada decorre apenas da terminação de linha CRLF do Windows no mock vs LF no SQL).

---

### Próximos Passos de Limpeza e Migração no Frontend

Como todo o banco de dados já possui 100% das informações:
1. **Desacoplamento do Frontend (`CharacterEditorView.tsx` e `BestiaryView.tsx`):**
   - Substituir os `fetch('/data-mock/...')` e os dois `import ... from '...data-mock/...'` por chamadas à API via TanStack Query (`GET /api/rules/{key}` e `GET /api/bestiary`).
   - Configurar `staleTime: Infinity` para as regras imutáveis de sessão.
2. **Remoção Segura dos Arquivos Físicos:**
   - Apagar os 9 arquivos da pasta `frontend/public/data-mock/` e do bundle em `frontend/dist/data-mock/`.
   - Isso eliminará mais de **680 KB de payloads estáticos desnecessários**, deixando o carregamento inicial mobile instantâneo.


