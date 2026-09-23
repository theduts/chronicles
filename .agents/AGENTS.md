# Agent Guidelines & Meta-Harness

Welcome to the AI Developer Meta-Harness for the Chronicles project.
This directory (`.agents/`) and `.planning/` govern how AI agents should interact with this codebase.

## Workflow Rules

1. **Do not modify production code blindly**. Always refer to `.planning/ROADMAP.md` and the current phase's `PLAN.md` before making changes.
2. **Read the PROJECT.md**. Ensure you understand the architecture (Spring Boot backend, React + TypeScript frontend) and the business logic (Daemon ruleset).
3. **Never bypass tests/validation (Evals Ativos via TDD)**. No feature is considered complete until its automated test is written and passing. These tests act as our execution `evals`. Se um teste falhar, a IA deve corrigir a implementação imediatamente antes de prosseguir.
4. **Follow the Get-Shit-Done (GSD) Workflow**. Use the available GSD skills (e.g. `gsd-plan-phase`, `gsd-execute-phase`, `gsd-verify-work`) to maintain state consistency in `.planning/STATE.md`.
5. **No dirty workarounds**. Write clean, maintainable code. No unused debugging scripts (`*.cjs` ou similar) in the production tree. If you need a scratchpad, use your artifact directory's scratch folder.
6. **Continuous Optimization (Proposer Loop)**. Ao final de cada fase, o sistema deve rodar `/gsd-extract-learnings` para mapear erros e retrabalhos. Os aprendizados extraídos devem ser adicionados a este documento (`AGENTS.md`) para que o harness evolua na próxima fase.
7. **Never execute git push**. The "git push" command can only be executed by the dev.
