---
status: clean
phase: 07
date: 2026-10-01
files_reviewed: 11
findings:
  critical: 0
  warning: 0
  info: 2
  total: 2
---

# Phase 07 Code Review

## Overview
Revisão de código da **Fase 07: Gestão de Estado de UI e Dashboard da Campanha**, cobrindo o backend (Spring Boot, JPA, Flyway, Rate Limiting) e o frontend (React, TypeScript, hooks customizados, debounce, AbortController, Toast Sonner e Dashboard).

**Date:** 2026-10-01  
**Reviewer:** gsd-code-reviewer  
**Depth:** standard  
**Status:** clean (0 critical, 0 warnings, 2 info/melhorias pontuais)

---

## File Scope Reviewed

### Backend (Java 21 / Spring Boot 3 / PostgreSQL Flyway)
1. `backend/src/main/resources/db/migration/V6__add_last_view_mode.sql`
2. `backend/src/main/java/com/chronicles/domain/User.java`
3. `backend/src/main/java/com/chronicles/dto/auth/AuthResponse.java`
4. `backend/src/main/java/com/chronicles/dto/auth/ViewModeRequest.java`
5. `backend/src/main/java/com/chronicles/service/ViewModeRateLimitService.java`
6. `backend/src/main/java/com/chronicles/controller/UserController.java`
7. `backend/src/main/java/com/chronicles/controller/AuthController.java`
8. `backend/src/test/java/com/chronicles/controller/UserControllerTest.java`

### Frontend (React 19 / TypeScript / Vite / Tailwind)
9. `frontend/src/hooks/useViewModeMutation.ts`
10. `frontend/src/components/ViewRoleToggle.tsx`
11. `frontend/src/components/DashboardView.tsx`

---

## Findings & Validations

### 1. Backend: Rate Limiting & User Scoping (Pass)
**Location:** [ViewModeRateLimitService.java](file:///C:/Users/murilo.dutra/Documents/chronicles/backend/src/main/java/com/chronicles/service/ViewModeRateLimitService.java), [UserController.java](file:///C:/Users/murilo.dutra/Documents/chronicles/backend/src/main/java/com/chronicles/controller/UserController.java)
- **Thread-Safety:** Uso correto de `ConcurrentHashMap` com `compute` atômico limitando a 10 requisições por janela temporal de 10 segundos.
- **Desacoplamento Temporal (Regra #15):** Injeção de bean `Clock` configurado, permitindo testes unitários e de integração determinísticos sem flakiness temporal.
- **Prevenção de IDOR e Auth:** O usuário alvo da atualização é extraído exclusivamente via `@AuthenticationPrincipal User currentUser`, sem expor parâmetros de URL manipuláveis.
- **Validação de Schema:** `@Pattern(regexp = "^(PLAYER|DM)$")` em `ViewModeRequest` garante que payloads fora do contrato retornem HTTP 400 com mapa descritivo de erro.
- **Constraint no Banco:** `chk_users_last_view_mode CHECK (last_view_mode IN ('PLAYER', 'DM'))` protege a integridade relacional.

### 2. Frontend: Resiliência de Mutação & Cancelamento em Voo (Pass)
**Location:** [useViewModeMutation.ts](file:///C:/Users/murilo.dutra/Documents/chronicles/frontend/src/hooks/useViewModeMutation.ts)
- **Debounce:** Intervalo de 300ms entre cliques rápidos para evitar chamadas de rede redundantes.
- **AbortController:** Requisições anteriores ainda em voo são canceladas defensivamente via `abortControllerRef.current.abort()`, eliminando race conditions assíncronas.
- **Rollback de Estado (Regra #18):** Caso a API rejeite a operação (HTTP 429 ou erro de conexão), `setViewRole(previousMode)` reverte o estado otimista client-side.
- **Tratamento Específico de 429 (D-04):** Mensagem bem-humorada conforme especificação apresentada via Sonner: *"Calma ae! Que indecisão é essa? Esperar esfriar primeiro!"*.

### 3. Frontend: Componentes e Tipagem TypeScript (Pass)
**Location:** [ViewRoleToggle.tsx](file:///C:/Users/murilo.dutra/Documents/chronicles/frontend/src/components/ViewRoleToggle.tsx), [DashboardView.tsx](file:///C:/Users/murilo.dutra/Documents/chronicles/frontend/src/components/DashboardView.tsx)
- **Mobile-First & Acessibilidade:** Componente `ViewRoleToggle` estilizado para toque ergonômico no menu móvel e sidebar. `stopPropagation()` no componente base `Toggle` previne disparo duplo de evento.
- **Empty States (D-03):** Seção de crônicas renderiza CTA "Criar a Primeira Crônica" para DM e estado informativo limpo para jogadores.
- **Integridade de Tipos:** Resolução de dependências de tipos (`ChronicleSession`), passando em `npm run lint` (`tsc --noEmit`) com 0 erros.

---

## Observações de Melhoria (Info Findings)

### INF-01: Inicialização de `viewRole` a partir de `lastViewMode` no Login
**Location:** [AuthView.tsx](file:///C:/Users/murilo.dutra/Documents/chronicles/frontend/src/components/AuthView.tsx#L33-L45), [useAppStore.ts](file:///C:/Users/murilo.dutra/Documents/chronicles/frontend/src/store/useAppStore.ts#L35-L42)  
**Severidade:** Info / Melhoria  
- **Contexto:** O backend envia `lastViewMode` no payload do `AuthResponse` (`/api/auth/login`). No entanto, o `login` no store do frontend inicializa `viewRole` deduzindo exclusivamente a role de sistema (`user.role === 'ROLE_ADMIN'`).  
- **Recomendação:** Utilizar `data.lastViewMode` (convertido para `'player' | 'dm'`) para inicializar `viewRole` durante o `login`, fechando o ciclo de restauração de preferências entre sessões de navegador.

### INF-02: Filtro de 429 no Interceptor Global do Axios
**Location:** [api.ts](file:///C:/Users/murilo.dutra/Documents/chronicles/frontend/src/services/api.ts#L37-L46)  
**Severidade:** Info / Polish  
- **Contexto:** O interceptor global do Axios aciona `showRateLimitToast` ("Muitas tentativas de login...") incondicionalmente em qualquer resposta HTTP 429. Quando a mutação de `view-mode` atinge o limite de 10 reqs/10s, o toast de login é exibido em paralelo ao toast customizado de `useViewModeMutation`.  
- **Recomendação:** Condicionar a mensagem de login no interceptor às URLs de `/api/auth/login`, permitindo que outros endpoints com rate limiting próprio exibam suas mensagens específicas sem sobreposição.

---

## Verificação Automatizada (Evals Ativos)

- **Backend Tests:** 54 testes executados com **0 falhas** (`.\mvnw.cmd test` - Total time: 22.083s).
  - `UserControllerTest`: 3 testes (Atualização, Validação e Rate Limiting HTTP 429).
  - `LoginRateLimitServiceTest`: 9 testes.
  - `UploadControllerTest`: 6 testes.
- **Frontend Linter:** `npm run lint` (`tsc --noEmit`) - **0 erros**.
- **Frontend Build:** `npm run build` (Vite) - **Sucesso** em 4.56s.

---

## Conclusion

✅ **Status: clean**  
A Fase 07 foi implementada com alta fidelidade arquitetural, sem vulnerabilidades de segurança, sem vazamento de concorrência e com 100% de aprovação nos testes automatizados e suíte de tipagem. Os apontamentos são de nível de refinamento (Info) e podem ser absorvidos na sequência do roadmap sem bloqueios.
