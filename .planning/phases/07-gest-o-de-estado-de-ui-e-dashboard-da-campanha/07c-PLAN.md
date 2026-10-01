---
phase: 07-gest-o-de-estado-de-ui-e-dashboard-da-campanha
plan: 07c
title: Correct ViewRoleToggle Event Propagation & Add Dev Request Logging
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/ViewRoleToggle.tsx
  - frontend/src/hooks/useViewModeMutation.ts
autonomous: true
gap_closure: true
mode: gap_closure
source_gaps:
  - test: 3
    truth: "A alternância rápida do modo de visão (toggle Jogador/Mestre) dispara requisições throttled com debounce/AbortController no frontend, respeitando o limite de 10 requisições por 10 segundos no backend sem gerar erros desnecessários ou inconsistências de UI."
---

# 07c-PLAN: Correct ViewRoleToggle Event Propagation & Add Dev Request Logging

## Objective
Fix event handler propagation in `ViewRoleToggle.tsx` to prevent redundant/conflicting toggle calls, and add explicit `console.debug` logging in `useViewModeMutation.ts` when sending requests to PATCH `/api/users/me/view-mode`.

## Tasks

<task>
<action>
Update `frontend/src/components/ViewRoleToggle.tsx` to ensure clicking the outer container or inner toggle cleanly triggers `toggleViewMode` exactly once per user action, avoiding conflicting/nested click events between wrapper container and toggle button.
</action>
<read_first>
- frontend/src/components/ViewRoleToggle.tsx
- frontend/src/components/Toggle.tsx
</read_first>
<acceptance_criteria>
- Clicking ViewRoleToggle cleanly triggers `toggleViewMode`.
- No conflicting or nested double-click events between wrapper container and toggle button.
</acceptance_criteria>
</task>

<task>
<action>
Update `frontend/src/hooks/useViewModeMutation.ts` to add explicit debug logging (`console.debug('[ViewMode] Dispatching PATCH /api/users/me/view-mode:', payload)`) immediately before firing the API request in the debounced handler so developers/testers can clearly observe outgoing requests in Browser DevTools Console.
</action>
<read_first>
- frontend/src/hooks/useViewModeMutation.ts
</read_first>
<acceptance_criteria>
- Debug log exists inside the debounced callback in `useViewModeMutation.ts`.
- Outgoing requests are logged to the console before `api.patch`.
</acceptance_criteria>
</task>

## Verification
- Run frontend typecheck (`npm run lint` or `tsc --noEmit`) and build (`npm run build`) to confirm no syntax or component errors.
