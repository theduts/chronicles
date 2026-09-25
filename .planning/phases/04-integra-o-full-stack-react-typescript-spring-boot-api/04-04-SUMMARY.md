---
phase: "04"
plan: "04-04"
title: "Campanhas e DM Review"
status: "completed"
completed_at: "2026-09-24T22:21:00Z"
requirements:
  - "FR-FRONT-04"
---

# Plan 04-04: Campanhas e DM Review - Summary

## O que foi construído
- Em `frontend/src/components/CampaignsView.tsx`:
  - Integração de `useMutation` do React Query chamando os endpoints REST `POST /api/campaigns` (criação) e `PUT /api/campaigns/{id}` (atualização de metadados, universo, lore e ilustração).
  - Invalidação automática de cache de queries com sincronização do ID da campanha ativa.
- Criação de `frontend/src/components/Campaigns.tsx` exportando `CampaignsView`.
- Criação de `frontend/src/components/CampaignDMReview.tsx`:
  - Painel exclusivo para o Mestre da campanha com polling em tempo real (`refetchInterval: 10000`) para detecção imediata de fichas submetidas pelos jogadores.
  - Filtro automático de fichas com `isPendingDMReview == true`.
  - Botão "Aprovar Evolução" disparando `POST /api/campaigns/{id}/approve-character/{characterId}` via `useMutation`, com mensagens de feedback e invalidação de cache.
  - Botão "Recusar" e visualização detalhada das modificações propostas.

## Verificação
- Empacotamento de produção `npm run build` executado com sucesso e zero erros de tipo/build.
- Endpoints de campanhas e aprovação mapeados conforme a especificação da Fase 3.
