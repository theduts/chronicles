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
- [ ] **Módulo Auth/User:** Implementar cadastro, autenticação e tokens (JWT/Security).
- [ ] **Módulo Character:** Implementar CRUD completo de fichas (atributos, pontos de status, perícias, aprimoramentos, magia, proteções, equipamentos, companheiros) e fluxo de submissão para revisão (`isPendingDMReview`).
- [ ] **Módulo Campaign:** Implementar gestão de campanhas (mestre, jogadores vinculados, histórico, aprovação de fichas pelo mestre).
- [ ] **Módulo Bestiário & Notas:** Implementar CRUD de monstros/NPCs e diário de sessão/anotações.
- [ ] Escrever testes unitários e de integração (JUnit 5 + Spring Boot Test).

---

## Phase 4: Integração Full-Stack (React + TypeScript ↔ Spring Boot API)
**Objetivo:** Conectar a interface React existente à API Spring Boot, substituindo os estados mockados por persistência real no Supabase Postgres via API.

### Tarefas Chave
- [ ] Criar camada de comunicação HTTP (`src/services/api.ts`) no frontend React usando Axios ou Fetch.
- [ ] Conectar os fluxos de Login / Cadastro de Usuários.
- [ ] Integrar a Dashboard de fichas e o Editor de Personagem com os endpoints REST da fase 3.
- [ ] Integrar a Dashboard de campanhas e o painel de aprovação do mestre (DM Review).
- [ ] Integrar as telas de anotações, grimório e bestiário.

---

## Phase 5: Validação UAT, Refinamento e Polimento
**Objetivo:** Validar o fluxo de ponta a ponta, garantir a corretude das regras Daemon e polir a experiência de uso.

### Tarefas Chave
- [ ] Executar testes de aceitação do usuário (UAT) para criação de ficha completa Daemon.
- [ ] Testar a experiência do mestre ao aprovar fichas e gerenciar sessões.
- [ ] Adicionar tratamento refinado de erros no frontend (toasts, loading states, fallbacks).
- [ ] Documentar passos para execução local e deployment da solução full‑stack.
