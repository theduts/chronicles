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

---

## Phase 6: Ajustes Base & Upload de Imagens

**Objetivo:** Remover campos não utilizados (role), implementar a infraestrutura inicial de imagens estáticas (fallbacks) e preparar o serviço MinIO com o endpoint de upload para o backend.

**Plans:** 3/3 plans executed

### Tarefas Chave

- [x] Remover seleção de `role` do fluxo de cadastro (Frontend e Backend).
- [x] Implementar e servir placeholders locais na UI.
- [x] Configurar backend para suporte ao MinIO/S3 e criar o endpoint estrito `POST /api/uploads/images`.
- [x] Implementar integração no frontend para envio de arquivos de mídia (imagens).

Plans:
**Wave 1**

- [x] 01-auth-role-refactor-PLAN.md — Auth Role Refactoring (wave 1)
- [x] 02-minio-infrastructure-PLAN.md — MinIO Infrastructure & Upload Endpoint (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-frontend-upload-ui-PLAN.md — Frontend Upload UI & Fallbacks (wave 2)

---

## Phase 7: Gestão de Estado de UI e Dashboard da Campanha

**Objetivo:** Introduzir a preferência de visualização Jogador/Mestre (`lastViewMode`) com controle de resiliência e criar o painel de "História" da campanha.

**Plans:** 2/2 plans complete

### Tarefas Chave

- [x] Adicionar `last_view_mode` no DB via Flyway e atualizar DTOs de login e user.
- [x] Implementar `PATCH /api/users/me/view-mode` com rate limit progressivo.
- [x] Ajustar o switch no Frontend com debounce e abort signal.
- [x] Criar a visão `/historia` contendo o banner triplo (Lore, Último Capítulo, Contratos).
- [x] Consumir e renderizar os cards das últimas 3 crônicas vinculadas à campanha.

---

## Phase 8: Arquivo de Crônicas e Enciclopédia (Lore)

**Objetivo:** Refinar a tela de arquivo completo de sessões (`/cronicas`) e implementar o ecossistema da galeria/lore em `/cronicas/historia_campanha`.

### Tarefas Chave

- [ ] Criar visualização expandida e edição inline das crônicas (Título, Capa, Missão, Local, Data, etc.) com API para persistência.
- [ ] Desenvolver o CRUD na tabela `campaign_lore` baseada no tipo `category` e armazenar propriedades variáveis em JSONB.
- [ ] Construir o modal "Galeria Visual da Campanha" com filtros de categorização.
- [ ] Adicionar o suporte a privacidade de visibilidade (`is_visible`) para o Mestre (secretos).

---

## Phase 9: Gerenciamento Avançado de NPCs

**Objetivo:** Migrar o módulo de NPCs do mestre de localStorage para a persistência real da API com vínculos em campanhas.

### Tarefas Chave

- [ ] Implementar a tela `/npcs` exclusiva para DMs/Mestres, consumindo via React Query.
- [ ] Implementar o CRUD completo na API para persistir na tabela `campaign_npcs`.
- [ ] Implementar a flag `is_persona` para promover NPCs ao painel de Enciclopédia.
