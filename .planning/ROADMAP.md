# Roadmap de Desenvolvimento: Chronicles RPG

## Phase 1: Frontend Hygiene & Meta-Harness Setup

**Objetivo:** Limpar o código front‑end removendo scripts e testes desnecessários e criar a base de um meta‑harness (`.agents/`) com o guia `AGENTS.md` que define como usar o diretório `.planning/` para desenvolvimento limpo, seguro e inteligente.

### Tarefas Chave

- [x] Remover arquivos `*.cjs` de utilidade/depuração que não são importados.
- [x] Atualizar `package.json` removendo scripts relacionados e adicionando `clean:frontend` (opcional).
- [x] Criar diretório `.agents/` na raiz.
- [x] Criar `.agents/AGENTS.md` com orientação de uso de agentes, fluxo de trabalho e boas práticas.
- [x] Criar/atualizar `.planning/README.md` apontando para o guia de agentes.

---

## Phase 2: Setup da Infraestrutura Backend Spring Boot & Docker Postgres (Flyway)

**Objetivo:** Estruturar a base de dados no PostgreSQL (via Docker Compose), versionar o esquema completo de 13 tabelas com Flyway (incluindo seeds de regras Daemon), configurar a aplicação Spring Boot 3.x com Java 21 e disponibilizar a documentação OpenAPI/Swagger.

### Tarefas Chave

- [x] Modelar e documentar o schema completo e regras de negócio em `backend/DATABASE_DESIGN.md`.
- [x] Criar script de migração Flyway `V1__initial_schema.sql` com as 13 tabelas consolidadas: `users`, `campaigns`, `campaign_players`, `characters`, `campaign_npcs`, `bestiary_monsters`, `campaign_lore`, `campaign_chronicles`, `contracts`, `notes`, `system_rules`, `feedbacks`, `spells`.
- [x] Criar script de seed Flyway `V2__seed_system_rules.sql` populando `system_rules` com dados oficiais do Daemon (`data-mock`).
- [x] Criar script de seed Flyway `V3__seed_official_bestiary.sql` com 295 monstros oficiais em UTF-8.
- [x] Validar a execução das migrações Flyway no container Docker PostgreSQL (`localhost:4321/chronicles`).
- [x] Inicializar o projeto Spring Boot em `backend/` com Java 21 e Maven (Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok, Validation, Flyway).
- [x] Configurar `application.yml` apontando para o Docker Postgres e MinIO.
- [x] Configurar Swagger UI / OpenAPI para documentação dos endpoints e validar a inicialização da API.

---

## Phase 3: Desenvolvimento da API RESTful (Java + Spring Boot)

**Objetivo:** Desenvolver as regras de negócio, serviços, repositórios e controllers REST para gerenciar usuários, fichas de personagem Daemon, campanhas, anotações e bestiário.

### Tarefas Chave

- [x] **Módulo Auth/User:** Implementar cadastro, autenticação e tokens (JWT/Security).
- [x] **Módulo Character:** Implementar CRUD completo de fichas (atributos, pontos de status, perícias, aprimoramentos, magia, proteções, equipamentos, companheiros) e fluxo de submissão para revisão (`isPendingDMReview`).
- [x] **Módulo Campaign:** Implementar gestão de campanhas (mestre, jogadores vinculados, histórico, aprovação de fichas pelo mestre).
- [x] **Módulo Bestiário & Notas:** Implementar CRUD de monstros/NPCs e diário de sessão/anotações.
- [x] Escrever testes unitários e de integração (JUnit 5 + Spring Boot Test).

---

## Phase 4: Integração Full-Stack (React + TypeScript ↔ Spring Boot API)

**Objetivo:** Conectar a interface React existente à API Spring Boot, substituindo os estados mockados por persistência real no Supabase Postgres via API.

### Tarefas Chave

- [x] Criar camada de comunicação HTTP (`src/services/api.ts`) no frontend React usando Axios ou Fetch.
- [x] Conectar os fluxos de Login / Cadastro de Usuários.
- [x] Integrar a Dashboard de fichas e o Editor de Personagem com os endpoints REST da fase 3.
- [x] Integrar a Dashboard de campanhas e o painel de aprovação do mestre (DM Review).
- [x] Integrar as telas de anotações, grimório e bestiário.

---

## Phase 5: Validação UAT, Refinamento e Polimento

**Objetivo:** Validar o fluxo de ponta a ponta, garantir a corretude das regras Daemon e polir a experiência de uso.

**Plans:** 10/10 plans executed

### Tarefas Chave

- [x] Executar testes de aceitação do usuário (UAT) para criação de ficha completa Daemon.
- [x] Testar a experiência do mestre ao aprovar fichas e gerenciar sessões.
- [x] Adicionar tratamento refinado de erros no frontend (toasts, loading states, fallbacks).
- [x] Implementar proteção de segurança contra força bruta no Login (Rate Limiting de requisições / limite de tentativas).
- [x] Documentar passos para execução local e deployment da solução full‑stack (incluindo Dockerfiles multi-stage para backend Spring Boot e frontend Nginx para empacotamento completo em containers / `docker build`).

Plans:
**Wave 1**

- [x] 05-01-PLAN.md — Gates: formato da tabela `login_attempts` (decisão one-way) e legitimidade do pacote `sonner` (wave 1)
- [x] 05-02-PLAN.md — Dockerfiles multi-stage, CORS/forwarded headers via env e `docs/DEPLOYMENT.md` (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 05-03-PLAN.md — TRACER: bloqueio de login ponta a ponta (429 + Retry-After) e superfície global de notificação (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 05-04-PLAN.md — Job `@Scheduled` de limpeza e cobertura automatizada dos tiers e da persistência (wave 3)
- [x] 05-05-PLAN.md — Migração dos 57 toasts locais do CharacterEditorView (wave 3)
- [x] 05-06-PLAN.md — Migração de toasts das 4 views restantes e remoção do mock `INITIAL_NOTES` (wave 3)
- [x] 05-07-PLAN.md — Skeleton loaders e empty state nas listas assíncronas (wave 3)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 05-08-PLAN.md — Erros de validação campo a campo nos formulários de ficha (wave 4)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 05-09-PLAN.md — Documento de checklist UAT guiado, 4 grupos de fluxo (wave 5)

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 05-10-PLAN.md — Execução manual do UAT e sign-off (wave 6)

