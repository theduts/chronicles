---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 3 Completed (Ready for Proposer Loop / Next Phase)
last_updated: "2026-09-25T01:04:45.292Z"
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 11
  completed_plans: 5
  percent: 40
---

# Estado Atual do Projeto: Chronicles RPG

## Status Geral

- **Milestone 1:** Inicialização e Estruturação Full-Stack
- **Mapeamento do Codebase Frontend:** Concluído ([.planning/codebase/](file:///c:/Users/murilo.dutra/Documents/chronicles/.planning/codebase))
- **Fase 1 (Frontend Hygiene & Meta-Harness):** Concluída.
- **Fase 2 (Setup da Infraestrutura Backend Spring Boot & Docker Postgres / Flyway):** Concluída com UAT 100% aprovado.
- **Fase 3 (Desenvolvimento da API RESTful Java + Spring Boot):** Concluída com UAT 100% aprovado (6/6 verificações UAT passadas, 4/4 planos executados e 18 testes automatizados passando).
  - **Plano 03-01 (Segurança & Autenticação JWT):** Concluído.
  - **Plano 03-02 (Personagens & Validação Daemon JSONB):** Concluído.
  - **Plano 03-03 (Campanhas & Fluxo DM Review & Anotações):** Concluído (Migration V4 ON DELETE SET NULL aplicada).
  - **Plano 03-04 (Bestiário Oficial, Grimório e Contratos):** Concluído.
- **Próximo Passo:** Execução do Proposer Loop (`/gsd-extract-learnings`) ou avanço direto para o planejamento da Fase 4 (Integração Full-Stack React + TypeScript ↔ Spring Boot API).

---

## Memória do Projeto & Decisões Arquiteturais

- **Mapeamento do Frontend:** O frontend React + TypeScript existente foi completamente mapeado e documentado em 7 relatórios técnicos em `.planning/codebase/`.
- **Sistema de Regras:** Daemon / Tormenta Daemon é o sistema primário (regras em `regras/`), com modelo de dados extensível para suportar novos sistemas futuramente.
- **Backend Target:** Java 21 + Spring Boot 3.x em `backend/`.
- **Banco de Dados Target:** PostgreSQL 16 via Docker Compose (`docker/docker-compose.yml`, porta `4321`) com storage MinIO. Versionamento de schema via Flyway.
- **Schema e Tabelas (13):** Documentadas no `backend/DATABASE_DESIGN.md` cobrindo users, characters (híbrido com JSONB e aprovação DM), campaigns, campaign_players, campaign_npcs, bestiary_monsters (catálogo oficial e da campanha), campaign_lore (enciclopédia polimórfica), campaign_chronicles, contracts, notes, system_rules, feedbacks e spells.
- **Frontend Target:** React 19 + TypeScript + Vite + Tailwind CSS em `frontend/`.
