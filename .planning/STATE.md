---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 05 Completed
stopped_at: Phase 5 UAT Completed and Signed Off
last_updated: "2026-09-29T13:58:00.000Z"
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 31
  completed_plans: 31
  percent: 100
---

# Estado Atual do Projeto: Chronicles RPG

## Status Geral

- **Milestone 1:** Inicialização e Estruturação Full-Stack — **100% Concluído**
- **Mapeamento do Codebase Frontend:** Concluído ([.planning/codebase/](file:///c:/Users/murilo.dutra/Documents/chronicles/.planning/codebase))
- **Fase 1 (Frontend Hygiene & Meta-Harness):** Concluída.
- **Fase 2 (Setup da Infraestrutura Backend Spring Boot & Docker Postgres / Flyway):** Concluída com UAT 100% aprovado.
- **Fase 3 (Desenvolvimento da API RESTful Java + Spring Boot):** Concluída com UAT 100% aprovado (18 testes automatizados passando).
- **Fase 4 (Integração Full-Stack React + TypeScript ↔ Spring Boot API):** Concluída com UAT 100% aprovado (6/6 testes de aceitação validados).
- **Fase 5 (Validação UAT, Refinamento e Polimento):** **Concluída com 100% de Aprovação (10/10 planos executados)**.
  - **Plano 05-01 (Decisões Estruturais & Gates de Dependência):** Concluído.
  - **Plano 05-02 (Multi-stage Dockerfiles, Nginx & Guia de Deploy):** Concluído.
  - **Plano 05-03 (Tracer: Rate Limiting de Login 429 & Toast Provider Sonner):** Concluído.
  - **Plano 05-04 (Job Scheduled de Limpeza de Tentativas & Testes de Integração):** Concluído.
  - **Plano 05-05 (Migração de Toasts do CharacterEditorView para Sonner):** Concluído.
  - **Plano 05-06 (Migração das Demais Views & Expurgo do mockData.ts):** Concluído.
  - **Plano 05-07 (Skeleton Loaders sem Layout Shift & Empty States):** Concluído.
  - **Plano 05-08 (Validação Inline Campo a Campo no Editor de Personagens):** Concluído.
  - **Plano 05-09 (Checklist UAT Abrangente dos 4 Grupos de Fluxo):** Concluído.
  - **Plano 05-10 (Execução UAT, Suíte Backend Verde e Sign-Off Formal):** Concluído.

---

## Memória do Projeto & Decisões Arquiteturais

- **Mapeamento do Frontend:** O frontend React + TypeScript existente foi completamente mapeado e documentado em 7 relatórios técnicos em `.planning/codebase/`.
- **Sistema de Regras:** Daemon / Tormenta Daemon é o sistema primário (regras em `regras/`), com modelo de dados extensível para suportar novos sistemas futuramente.
- **Backend Target:** Java 21 + Spring Boot 3.x em `backend/`.
- **Banco de Dados Target:** PostgreSQL 16 via Docker Compose (`docker/docker-compose.yml`, porta `4321`) com storage MinIO. Versionamento de schema via Flyway.
- **Schema e Tabelas (14):** Documentadas no `backend/DATABASE_DESIGN.md` e migrations Flyway (V1 a V5) cobrindo users, characters (híbrido com JSONB e aprovação DM), campaigns, campaign_players, campaign_npcs, bestiary_monsters, campaign_lore, campaign_chronicles, contracts, notes, system_rules, feedbacks, spells e login_attempts.
- **Frontend Target:** React 19 + TypeScript + Vite + Tailwind CSS em `frontend/`.
- **Deploy & Containerização:** Dockerfiles multi-stage para Spring Boot (`eclipse-temurin:21-jre-alpine`) e Frontend Nginx (`nginx:alpine`) documentados em `docs/DEPLOYMENT.md`.
- **Segurança Auth:** Rate Limiting progressivo com bloqueio temporário (1 min, 5 min, 30 min) por chave composta `username + ip_address` respondendo com HTTP 429 e `Retry-After`. Notificações com countdown em tempo real via `sonner`.
- **Feedback & Validações:** Erros de validação HTTP 400 do backend mapeados inline diretamente sob os campos (`name`, `level`, `xp`) com tokens semânticos do tema.

## Session

**Last session:** 2026-09-29T12:17:00.000Z
**Stopped at:** Phase 5 Finalized and Signed Off
**Resume file:** docs/UAT-CHECKLIST.md

