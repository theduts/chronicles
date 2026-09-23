# Roadmap de Desenvolvimento: Chronicles RPG

## Phase 1 – Frontend Hygiene & Meta‑Harness Setup
**Objetivo:** Limpar o código front‑end removendo scripts e testes desnecessários e criar a base de um meta‑harness (`.agents/`) com o guia `AGENTS.md` que define como usar o diretório `.planning/` para desenvolvimento limpo, seguro e inteligente.

### Tarefas Chave
- [ ] Remover arquivos `*.cjs` de utilidade/depuração que não são importados.
- [ ] Atualizar `package.json` removendo scripts relacionados e adicionando `clean:frontend` (opcional).
- [ ] Criar diretório `.agents/` na raiz.
- [ ] Criar `.agents/AGENTS.md` com orientação de uso de agentes, fluxo de trabalho e boas práticas.
- [ ] Criar/atualizar `.planning/README.md` apontando para o guia de agentes.

---

## Phase 2 – Setup da Infraestrutura Backend Spring Boot & Supabase Postgres
**Objetivo:** Estruturar a aplicação Spring Boot 3.x com Java 21, configurar a conexão JDBC com o Supabase PostgreSQL, criar o esquema de tabelas/migrations e disponibilizar a documentação OpenAPI/Swagger.

### Tarefas Chave
- [ ] Inicializar o projeto Spring Boot em `backend/` com Java 21 e Maven/Gradle (Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok, Validation, Flyway).
- [ ] Configurar `application.yml` para conexão com o banco de dados PostgreSQL do Supabase.
- [ ] Criar scripts SQL de migração/esquema para tabelas: `users`, `campaigns`, `characters`, `character_skills`, `spells`, `notes`, `bestiary_monsters`.
- [ ] Configurar Swagger UI / OpenAPI para documentação dos endpoints.
- [ ] Validar a inicialização da API e conexão com o Supabase.

---

## Phase 3 – Desenvolvimento da API RESTful (Java + Spring Boot)
**Objetivo:** Desenvolver as regras de negócio, serviços, repositórios e controllers REST para gerenciar usuários, fichas de personagem Daemon, campanhas, anotações e bestiário.

### Tarefas Chave
- [ ] **Módulo Auth/User:** Implementar cadastro, autenticação e tokens (JWT/Security).
- [ ] **Módulo Character:** Implementar CRUD completo de fichas (atributos, pontos de status, perícias, aprimoramentos, magia, proteções, equipamentos, companheiros) e fluxo de submissão para revisão (`isPendingDMReview`).
- [ ] **Módulo Campaign:** Implementar gestão de campanhas (mestre, jogadores vinculados, histórico, aprovação de fichas pelo mestre).
- [ ] **Módulo Bestiário & Notas:** Implementar CRUD de monstros/NPCs e diário de sessão/anotações.
- [ ] Escrever testes unitários e de integração (JUnit 5 + Spring Boot Test).

---

## Phase 4 – Integração Full‑Stack (React + TypeScript ↔ Spring Boot API)
**Objetivo:** Conectar a interface React existente à API Spring Boot, substituindo os estados mockados por persistência real no Supabase Postgres via API.

### Tarefas Chave
- [ ] Criar camada de comunicação HTTP (`src/services/api.ts`) no frontend React usando Axios ou Fetch.
- [ ] Conectar os fluxos de Login / Cadastro de Usuários.
- [ ] Integrar a Dashboard de fichas e o Editor de Personagem com os endpoints REST da fase 3.
- [ ] Integrar a Dashboard de campanhas e o painel de aprovação do mestre (DM Review).
- [ ] Integrar as telas de anotações, grimório e bestiário.

---

## Phase 5 – Validação UAT, Refinamento e Polimento
**Objetivo:** Validar o fluxo de ponta a ponta, garantir a corretude das regras Daemon e polir a experiência de uso.

### Tarefas Chave
- [ ] Executar testes de aceitação do usuário (UAT) para criação de ficha completa Daemon.
- [ ] Testar a experiência do mestre ao aprovar fichas e gerenciar sessões.
- [ ] Adicionar tratamento refinado de erros no frontend (toasts, loading states, fallbacks).
- [ ] Documentar passos para execução local e deployment da solução full‑stack.
