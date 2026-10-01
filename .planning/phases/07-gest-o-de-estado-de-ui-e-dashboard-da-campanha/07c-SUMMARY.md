---
status: complete
phase: 07-gest-o-de-estado-de-ui-e-dashboard-da-campanha
plan: 07c
title: Correct ViewRoleToggle Event Propagation & Add Dev Request Logging
mode: gap_closure
key_files:
  created: []
  modified:
    - "frontend/src/components/ViewRoleToggle.tsx"
    - "frontend/src/hooks/useViewModeMutation.ts"
---

# 07c-SUMMARY: Correct ViewRoleToggle Event Propagation & Add Dev Request Logging

## What was built
- Updated `ViewRoleToggle.tsx` so the entire container acts as the primary interactive element with keyboard support (`Enter`/`Space`) and `pointer-events-none` on nested elements, preventing duplicate/conflicting click event triggers between parent and child elements.
- Added explicit `console.debug` logging in `useViewModeMutation.ts` detailing the optimistic state transition, request dispatching to `PATCH /api/users/me/view-mode`, request completion, and abort events so developers/testers can trace lifecycle events in DevTools Console.

## Verification
- Frontend typecheck (`npm run lint` / `tsc --noEmit`): 0 errors.
- Frontend build (`npm run build`): Vite production build compiled successfully in 16.71s.
- Backend test suite (`.\mvnw.cmd test`): 54 tests run, 0 failures, 0 errors, 0 skipped.
