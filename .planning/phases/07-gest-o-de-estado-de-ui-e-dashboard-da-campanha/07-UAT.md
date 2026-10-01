---
status: diagnosed
phase: 07-gest-o-de-estado-de-ui-e-dashboard-da-campanha
source:
  - .planning/phases/07-gest-o-de-estado-de-ui-e-dashboard-da-campanha/07a-SUMMARY.md
  - .planning/phases/07-gest-o-de-estado-de-ui-e-dashboard-da-campanha/07b-SUMMARY.md
  - .planning/phases/07-gest-o-de-estado-de-ui-e-dashboard-da-campanha/07c-SUMMARY.md
started: 2026-10-01T08:26:30-03:00
updated: 2026-10-01T09:20:15-03:00
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: pass

### 2. Persistência do Modo de Visão (last_view_mode) no Perfil e Login
expected: Ao fazer login no sistema, a resposta de autenticação (AuthResponse) inclui a preferência salva do usuário (`last_view_mode`). Ao alternar a visão (ex: Jogador vs Mestre), a escolha é salva no banco via endpoint PATCH `/api/users/me/view-mode`.
result: pass

### 3. Rate Limiting e Resiliência na Alternância de Visão (Debounce / AbortController)
expected: A alternância rápida do modo de visão (toggle Jogador/Mestre) dispara requisições throttled com debounce/AbortController no frontend, respeitando o limite de 10 requisições por 10 segundos no backend sem gerar erros desnecessários ou inconsistências de UI.
result: issue
reported: "onde consigo acessar os logs da API? O frontend não disparou nada?"
severity: major

### 4. Visualização Dinâmica do Dashboard da Campanha (/historia / DashboardView)
expected: A navegação pela rota do dashboard (`/historia` ou DashboardView) exibe as informações reais da campanha e fichas associadas a partir da API, exibindo empty states elegantes e apropriados quando não houver dados cadastrados.
result: pass

## Summary

total: 4
passed: 3
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "A alternância rápida do modo de visão (toggle Jogador/Mestre) dispara requisições throttled com debounce/AbortController no frontend, respeitando o limite de 10 requisições por 10 segundos no backend sem gerar erros desnecessários ou inconsistências de UI."
  status: failed
  reason: "User reported: onde consigo acessar os logs da API? O frontend não disparou nada?"
  severity: major
  test: 3
  root_cause: "Event propagation overlap between ViewRoleToggle container div and inner Toggle component, combined with 300ms debounce without explicit dev logging."
  artifacts:
    - path: "frontend/src/components/ViewRoleToggle.tsx"
      issue: "Redundant onClick handler on parent container div causing double trigger / cancellation on toggle click."
    - path: "frontend/src/hooks/useViewModeMutation.ts"
      issue: "Debounced mutation lacks console debug info during development."
  missing:
    - "Clean up click event handler in ViewRoleToggle.tsx (Resolved in 07c)"
    - "Add console logging in dev environment for view-mode mutation dispatch (Resolved in 07c)"
  fixed_in: 07c
  debug_session: .planning/debug/view-mode-toggle-issue.md
