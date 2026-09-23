# Estado Atual do Projeto: Chronicles RPG

## Status Geral
- **Milestone 1:** Inicialização e Estruturação Full-Stack
- **Mapeamento do Codebase Frontend:** Concluído ([.planning/codebase/](file:///c:/Users/murilo.dutra/Documents/chronicles/.planning/codebase))
- **Fase Atual:** Fase 1 Concluída.
- **Próximo Passo:** Iniciar Fase 2 – Setup da Infraestrutura Backend Spring Boot & Supabase Postgres (Executar `/gsd-plan-phase 2`).
- **Última Sessão:** Execução da Fase 1 concluída com sucesso (Frontend Hygiene & Meta-Harness).

---

## Memória do Projeto & Decisões Arquiteturais
- **Mapeamento do Frontend:** O frontend React + TypeScript existente foi completamente mapeado e documentado em 7 relatórios técnicos em `.planning/codebase/`.
- **Sistema de Regras:** Daemon / Tormenta Daemon é o sistema primário (regras em `regras/`), com modelo de dados extensível para suportar novos sistemas futuramente.
- **Backend Target:** Java 21 + Spring Boot 3.x em `backend/`.
- **Banco de Dados Target:** Supabase PostgreSQL conectado via Spring Data JPA (Hibernate JDBC).
- **Frontend Target:** React 19 + TypeScript + Vite + Tailwind CSS em `frontend/`.
- **Aprovação do Mestre:** Fluxo nativo onde alterações em fichas de jogadores em campanhas ativas passam por aprovação do Mestre (`isPendingDMReview`).
