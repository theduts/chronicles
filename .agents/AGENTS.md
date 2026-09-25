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

---

## Learned Rules & Best Practices (Proposer Loop Evals)

As lições aprendidas em cada fase concluída evoluem este harness para as fases subsequentes:

### Infraestrutura & Backend (Extraído da Fase 2)
1. **Comandos Maven no Windows:** Sempre utilizar o Maven Wrapper com sintaxe PowerShell `.\mvnw` ou `.\mvnw.cmd` diretamente a partir da pasta `backend/`.
2. **Flyway & JSONB / Textos Literais:** Sempre garantir `spring.flyway.placeholder-replacement: false` no `application.yml` para evitar erros ao processar dados de regras Daemon ou templates que contenham a sintaxe `${...}`.
3. **Portas e Conexão de Banco:** O PostgreSQL local via Docker Compose roda na porta **`4321`** (`jdbc:postgresql://localhost:4321/chronicles`) para evitar colisões com outros serviços locais na porta 5432.
4. **Padrão de Testes Automatizados (Fase 3 em diante):** Todo novo endpoint ou serviço deve conter:
   - Teste de domínio/unidade puro para as regras do sistema Daemon.
   - Teste de integração MockMvc para contrato de API REST (códigos de status HTTP, serialização JSON e validação de schema).
   - Manter o tempo total de execução da suíte de testes inferior a 15s para garantir alta cadência de feedback (Nyquist-compliant).

### Desenvolvimento API RESTful & Spring Boot (Extraído da Fase 3)
5. **Tipagem JSONB (Jackson + JPA):** Para o mapeamento de colunas JSONB genéricas (ex: `@JdbcTypeCode(SqlTypes.JSON)`), utilizar sempre coleções estritamente tipadas como `Map<String, Object>` ou `List<Object>` em vez de `java.lang.Object` para evitar falhas silenciosas de serialização no commit do EntityManager. Se possível, usar POJOs fortemente tipados.
6. **Spring Data JPA & JPQL Keywords:** Evitar nomes de propriedades ou métodos que contenham palavras reservadas do JPQL como "Or" (ex: `schoolOrFocus`), pois forçam desestruturação lógica indevida. Quando não for possível, utilizar queries explícitas via `@Query`.
7. **Compatibilidade Lombok + MapStruct (Java 26):** Garantir a inclusão explícita de `lombok-mapstruct-binding` no `maven-compiler-plugin` para contornar problemas de compatibilidade interna.
8. **Segurança (CORS):** Manter configurações de CORS estritas em `SecurityConfig.java`, restringindo `AllowedOriginPatterns` para os domínios da aplicação (`http://localhost:3000`) em vez de deixar configurações permissivas.
