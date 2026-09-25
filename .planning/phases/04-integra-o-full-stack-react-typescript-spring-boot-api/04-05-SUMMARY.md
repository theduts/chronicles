---
phase: "04"
plan: "04-05"
title: "Integração de Anotações e Bestiário"
status: "completed"
completed_at: "2026-09-24T22:25:00Z"
requirements:
  - "FR-FRONT-01"
---

# Plan 04-05: Integração de Anotações e Bestiário - Summary

## O que foi construído
- Em `frontend/src/App.tsx`:
  - Conectada a listagem de anotações com o endpoint REST `GET /api/notes` via `useQuery`.
  - Implementadas mutações completas via `useMutation` para persistência de notas: criação (`POST /api/notes`), edição (`PUT /api/notes/{id}`) e remoção (`DELETE /api/notes/{id}`).
- Em `frontend/src/components/BestiaryView.tsx`:
  - Substituição da busca estática do `bestiario.json` pela chamada à API `GET /api/bestiary` trazendo os 295 monstros oficiais do catálogo Daemon e os monstros customizados da mesa, mantendo fallback de segurança resiliente.
- Criação dos módulos de exportação componentes para compatibilidade estrita:
  - `frontend/src/components/Notes.tsx`
  - `frontend/src/components/Bestiary.tsx`
  - `frontend/src/components/Chronicles.tsx`

## Verificação
- Empacotamento de produção `npm run build` executado com sucesso e zero erros de tipo/build.
- Comunicação integrada entre telas secundárias e a API Spring Boot.
