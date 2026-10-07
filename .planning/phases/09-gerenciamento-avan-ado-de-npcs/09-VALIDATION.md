---
phase: 09
slug: gerenciamento-avan-ado-de-npcs
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-06
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 / MockMvc / AssertJ (Backend) & TypeScript / Vite Build (Frontend) |
| **Config file** | `backend/pom.xml` / `frontend/package.json` |
| **Quick run command** | `.\mvnw.cmd test "-Dtest=CampaignNpcServiceTest"` |
| **Full suite command** | `.\mvnw.cmd test "-Dtest=CampaignNpcServiceTest,CampaignNpcControllerTest,RuleControllerTest"` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick tests
- **After every plan wave:** Run full tests
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 35 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | FR-NPC-01, FR-NPC-02 | T-09-02 | Strict JSONB column & schema constraints | integration | `.\mvnw.cmd test "-Dtest=RuleControllerTest"` | ✅ | ✅ green |
| 09-01-02 | 01 | 1 | FR-NPC-01, FR-NPC-02 | T-09-02 | Strongly typed JSONB mapping (`Map<String, Object>`) | unit & integration | `.\mvnw.cmd test "-Dtest=CampaignNpcServiceTest"` | ✅ | ✅ green |
| 09-01-03 | 01 | 1 | FR-NPC-01, FR-NPC-03 | T-09-01, NFR-03 | DM Authorization check & player privacy data masking | unit & integration | `.\mvnw.cmd test "-Dtest=CampaignNpcServiceTest,CampaignNpcControllerTest"` | ✅ | ✅ green |
| 09-02-01 | 02 | 2 | FR-NPC-01, FR-NPC-02 | — | Strict TypeScript typing & cache invalidation | build & contract | `npm run lint` | ✅ | ✅ green |
| 09-02-02 | 02 | 2 | FR-NPC-01 | T-09-03 | DM-only view displays secrets safely | build & visual | `npm run build` | ✅ | ✅ green |
| 09-02-03 | 02 | 2 | FR-NPC-01, FR-NPC-02 | — | React Query server state replaces localStorage | build & contract | `npm run build` | ✅ | ✅ green |
| 09-03-01 | 03 | 3 | FR-NPC-01, FR-NPC-02 | — | Controlled state cloning and template persistence | build & contract | `npm run build` | ✅ | ✅ green |
| 09-03-02 | 03 | 3 | FR-NPC-01, FR-NPC-03 | T-09-01 | DM promote & delete interactions | build & contract | `npm run build` | ✅ | ✅ green |
| 09-03-03 | 03 | 3 | FR-NPC-03 | T-09-04, NFR-03 | Non-DM player view strictly conceals combat data and secret notes | build & visual | `npm run build` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/src/test/java/com/chronicles/service/CampaignNpcServiceTest.java` — unit tests for CRUD, authorization and notes masking
- [x] `backend/src/test/java/com/chronicles/controller/CampaignNpcControllerTest.java` — MockMvc tests for REST endpoints, filters, templates, and player masking
- [x] `backend/src/test/java/com/chronicles/controller/RuleControllerTest.java` — MockMvc tests for system rules and NPC templates
- [x] `frontend/src/components/campaign/npc/NpcModal.tsx` & `NpcCard.tsx` — TypeScript type checking and Vite production build
- [x] `frontend/src/components/NPCsView.tsx` & `CampaignHistoryView.tsx` — TypeScript type checking and Vite production build

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card conditional layout rendering | D-08 | Visual rendering of narrative vs combat Bestiary-style card layout | Open `/npcs`, verify cards with combat data display HP/IP badges, attributes table, and abilities list; cards without combat data display pure narrative layout. |
| NPC Template preview and accordion | D-02 | Interactive accordion and modal UI interactions | Open "Adicionar NPC", toggle "Status pra combate", expand templates accordion, select template, verify stats populate correctly. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 35s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved

---

## Validation Audit 2026-10-06

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 9 |
| Escalated | 0 |
