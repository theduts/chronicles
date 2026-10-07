---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: milestone
status: Phase 9 validated (Nyquist compliant)
stopped_at: Phase 09 Nyquist validation complete. Ready for verification (/gsd-verify-work 9).
last_updated: "2026-10-06T21:46:00.000Z"
progress:
  total_phases: 9
  completed_phases: 8
  total_plans: 32
  completed_plans: 32
  percent: 98
---

# Estado Atual do Projeto: Chronicles RPG

## Status Geral

- **Milestone 1:** Inicialização e Estruturação Full-Stack — **100% Concluído**
- **Milestone 2:** Evolução de UI/UX e Gestão de Campanha — **96% Concluído**
- **Fase 6 (Ajustes Base & Upload de Imagens):** 100% Concluído e Verificado (UAT OK)
- **Fase 7 (Gestão de Estado de UI e Dashboard da Campanha):** 100% Concluído e Verificado (GSD Gates OK)
- **Fase 8 (Arquivo de Crônicas e Enciclopédia Lore):** 100% Concluído e Verificado
- **Fase 9 (Gerenciamento Avançado de NPCs):** Execução Concluída (3/3 planos executados e validados)

---

## Memória do Projeto & Decisões Arquiteturais

- **Milestone 1 Concluída:** API e Frontend integrados com banco Supabase PostgreSQL e Flyway. Autenticação e gestão básica de fichas e campanhas concluídas com sucesso e validadas (UAT).
- **Mapeamento do Frontend:** O frontend React + TypeScript existente foi completamente mapeado e documentado em 7 relatórios técnicos em `.planning/codebase/`.
- **Sistema de Regras:** Daemon / Tormenta Daemon é o sistema primário (regras em `regras/`), com modelo de dados extensível.
- **Armazenamento de Imagens:** MinIO (local via Docker) / S3 compatível para uploads de avatares, mapas e capas (`POST /api/uploads/images`). Assets estáticos e fallbacks residem em `frontend/public/images/`.
- **Backend Target:** Java 21 + Spring Boot 3.x em `backend/`.
- **Frontend Target:** React 19 + TypeScript + Vite + Tailwind CSS em `frontend/`.
- **UI/UX e Estado:** Otimismo em alternância de view (Jogador/Mestre via `lastViewMode`) amparado por debounce, `AbortController` (frontend) e rate limiting restrito (backend HTTP 429).
- **Segurança Auth:** Rate Limiting progressivo com bloqueio temporário (1 min, 5 min, 30 min) por chave composta `username + ip_address`.
- **Lore & Crônicas (Fase 8):** Persistência completa em backend via endpoints REST `/api/campaigns/{id}/lore` e `/api/campaigns/{id}/chronicles`. Tipagem estrita JSONB `Map<String, Object>`, live preview drawer para desktop e edição inline em mobile.
- **Gerenciamento de NPCs (Fase 9):**
  - Migração Flyway `V7__add_template_columns_to_campaign_npcs.sql` adicionou `data JSONB` e `is_template BOOLEAN`, além de semear 15 templates oficiais na tabela `system_rules` (`npc_templates`).
  - Endpoints REST `/api/campaigns/{id}/npcs` suportam filtros `personaOnly` e `templateOnly`.
  - Sigilo garantido para jogadores: notas secretas do Mestre e dados de combate são estritamente mascarados na API e na Enciclopédia (D-06).
  - Frontend migrado 100% de LocalStorage para React Query, com renderização condicional (Bestiário vs Narrativo) e modal com clonagem de templates e edição livre de atributos e habilidades.

## Session

**Last session:** 2026-10-06T21:46:00.000Z
**Stopped at:** Phase 09 Nyquist validation complete (09-VALIDATION.md).
**Next step:** Verify Phase 9 (`/gsd-verify-work 9`) or Milestone Audit (`/gsd-audit-milestone`)
