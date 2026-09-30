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
8. **Always keep in mind the mobile-first estrategy**
   . O foco do desenvolvimento deve ser voltado a visão mobile então toda decisão deve ser prevista primeira pra como a visão no celular se comportará, depois as demais - telas grandes de PC e médias de Tablet

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

### Integração Full-Stack & Frontend React + TypeScript (Extraído da Fase 4)

9. **Gerenciamento de Estado do Servidor:** Nunca duplicar dados de requisições de API em estados locais com `useState`. O React Query (`@tanstack/react-query`) deve ser a fonte única de verdade para server state, utilizando invalidação de queries (`queryClient.invalidateQueries`) em mutações.
10. **Modularização de Componentes e Custom Hooks:** Evitar *God Components* como o `App.tsx` acumulando regras de negócio e chamadas de API. Extrair mutações e fluxos assíncronos para custom hooks modulares (ex: `useCharacterMutations`, `useNoteMutations`, `useNavigationRouting`).
11. **Validação Estrita de Tipagem TypeScript (TS2339):** Nunca acessar propriedades exclusivas de string (como `.length`) diretamente em variáveis que possam ser números ou opcionais. Utilizar sempre coerção defensiva: `String(val ?? '').length`.
12. **Configuração CORS Abrangente para Dev Frontend:** Em ambientes de desenvolvimento, configurar `AllowedOriginPatterns` no Spring Security para cobrir portas dinâmicas de frontend Vite (`http://localhost:3000`, `http://localhost:4000`, `http://localhost:5173`).
13. **Contratos e Endpoints Simétricos na API:** Todo fluxo de revisão ou aprovação no backend deve prever os caminhos simétricos de aprovação e rejeição (`/approve-character` e `/reject-character`) antes da integração no frontend para evitar retrabalho de transição entre fases.

### Validação UAT, Refinamento & Segurança (Extraído da Fase 5)

14. **Prevenção de Enumeração e Rate Limiting Progressivo:** Toda lógica de rate limiting / bloqueio de autenticação deve ser executada antes de qualquer busca de entidade por identificador, mantendo respostas (HTTP 401 e 429) e tempos uniformes para mitigar oráculos de enumeração. Requisições recebidas durante bloqueio ativo devem efetuar short-circuit sem incrementar contadores adicionais (anti-escalação).
15. **Desacoplamento Temporal para Testes Determinísticos:** Nunca invocar `Instant.now()`, `LocalDateTime.now()` ou `System.currentTimeMillis()` diretamente em serviços e schedulers com regras temporais. Injetar sempre um bean `Clock` configurado (`TimeConfig.java`), viabilizando testes unitários determinísticos com relógios fixos ou mutáveis sem `Thread.sleep()`.
16. **Testes de Persistência com `@UpdateTimestamp` do Hibernate:** Em testes de expurgo ou retenção de dados passados, evitar o uso de `save()` do repositório para definir timestamps retroativos caso o campo possua `@UpdateTimestamp`, pois o Hibernate redefinirá o valor para o instante atual. Utilizar queries nativas SQL direcionadas para simular registros antigos no banco de dados.
17. **Centralização de Feedback Visual (Toasts):** Não utilizar estados locais (`useState`) ou timers manuais (`setTimeout`) para banners e notificações dentro de views e formulários. Utilizar a superfície global padronizada (`sonner`), mantendo o design system semântico e consistente.
18. **Invalidação de Cache em Falhas de Mutação (React Query):** Sempre implementar handlers `onError` em mutations do React Query que realizem a invalidação da query afetada (`queryClient.invalidateQueries`) para evitar que estados otimistas client-side exibam dados como persistidos quando o backend rejeitou a alteração (HTTP 400/403/500).
19. **Preservação de IP Real com Proxies Reversos:** Em arquiteturas com containers Nginx/Traefik à frente do Spring Boot, sempre habilitar `server.forward-headers-strategy: framework` no `application.yml` para assegurar que `getRemoteAddr()` capture o IP real do cliente e não o IP do container proxy.

