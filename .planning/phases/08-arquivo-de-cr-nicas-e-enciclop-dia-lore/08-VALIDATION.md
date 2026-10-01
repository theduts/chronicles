---
phase: 08
slug: arquivo-de-cr-nicas-e-enciclop-dia-lore
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-01
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 / MockMvc / AssertJ (Backend) & Vite Build Validation (Frontend) |
| **Config file** | `backend/pom.xml` / `frontend/package.json` |
| **Quick run command** | `.\mvnw.cmd test -Dtest=CampaignLoreServiceTest,CampaignChronicleServiceTest` |
| **Full suite command** | `.\mvnw.cmd test -Dtest=CampaignLoreServiceTest,CampaignChronicleServiceTest,CampaignLoreAndChroniclesControllerTest` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick tests
- **After every plan wave:** Run full tests
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | FR-LORE-03 | — | DM/Player Visibility | unit & integration | `.\mvnw.cmd test -Dtest=CampaignLoreServiceTest,CampaignLoreAndChroniclesControllerTest` | ✅ | ✅ green |
| 08-01-02 | 01 | 1 | FR-CHRON-02 | — | Duplicate Session Check | unit & integration | `.\mvnw.cmd test -Dtest=CampaignChronicleServiceTest,CampaignLoreAndChroniclesControllerTest` | ✅ | ✅ green |
| 08-02-01 | 02 | 2 | FR-LORE-01 | — | React Query Cache & Offline Fallback | build & contract | `npm run build` | ✅ | ✅ green |
| 08-02-02 | 02 | 2 | FR-CHRON-01 | — | Live Preview Drawer & DM Authorization | build & contract | `npm run build` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/src/test/java/com/chronicles/service/CampaignLoreServiceTest.java` — unit tests for FR-LORE-03
- [x] `backend/src/test/java/com/chronicles/service/CampaignChronicleServiceTest.java` — unit tests for FR-CHRON-02
- [x] `backend/src/test/java/com/chronicles/controller/CampaignLoreAndChroniclesControllerTest.java` — MockMvc tests for REST endpoints
- [x] `frontend/src/components/CampaignHistoryView.tsx` & `useLoreMutations.ts` — Vite production build verification
- [x] `frontend/src/components/ChroniclesView.tsx` & `useChroniclesMutations.ts` — Vite production build verification

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drawer animation | D-02 | Visual animation behavior cannot be reliably automated | Open chronicle, click edit, verify drawer slides pushing modal aside. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved

---

## Validation Audit 2026-10-01

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 4 |
| Escalated | 0 |

