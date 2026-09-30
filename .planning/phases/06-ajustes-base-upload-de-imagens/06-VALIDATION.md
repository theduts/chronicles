---
phase: 06
slug: ajustes-base-upload-de-imagens
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-30
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript / `tsc --noEmit` (Frontend) & JUnit/Mockito/MockMvc (Backend) |
| **Config file** | `backend/pom.xml` / `frontend/package.json` |
| **Quick run command** | `cd backend && .\mvnw test -Dtest=UploadControllerTest` |
| **Full suite command** | `cd backend && .\mvnw test` / `cd frontend && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run target tests
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | FR-AUTH-01 | — | Default role assignment | unit | `cd backend && .\mvnw test -Dtest=AuthControllerTest` | ✅ `backend/src/test/.../AuthControllerTest.java` | ✅ green |
| 06-01-02 | 02 | 1 | FR-MEDIA-02 | T-06-01 | File rename & 5MB size limit | integration | `cd backend && .\mvnw test -Dtest=UploadControllerTest,FileStorageServiceTest` | ✅ `backend/src/test/.../UploadControllerTest.java` | ✅ green |
| 06-01-03 | 03 | 2 | FR-MEDIA-01 | — | Fallback image rendering | static/type | `cd frontend && npm run lint` | ✅ `frontend/src/components/common/ImageWithFallback.tsx` | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `backend/src/test/java/com/chronicles/controller/UploadControllerTest.java` — unit/integration tests for FR-MEDIA-02
- [x] `backend/src/test/java/com/chronicles/service/FileStorageServiceTest.java` — unit tests for MinIO file storage service
- [x] `frontend/src/components/common/ImageWithFallback.tsx` — fallback component for FR-MEDIA-01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Upload pipeline via UI | FR-MEDIA-01 | E2E interaction with OS file picker | Select file via UI, save, check MinIO console |

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

## Validation Audit 2026-09-30

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 3 |
| Escalated | 0 |

