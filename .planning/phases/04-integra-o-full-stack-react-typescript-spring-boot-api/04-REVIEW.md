---
phase: "04"
status: "issues_found"
files_reviewed: 42
---

# Code Review: Phase 04

## Resumo
A revisão identificou problemas críticos relacionados à persistência de dados no backend durante ações de aprovação/rejeição de fichas, além de antipadrões na utilização do React Query e acúmulo de responsabilidades no `App.tsx`.

## Findings

### CR-01: Funções de Aprovação/Rejeição no `App.tsx` não persistem no Backend
- **Severity:** Critical
- **File:** `frontend/src/App.tsx`
- **Description:** As funções `handleApproveCharacter` e `handleRejectCharacter` localizadas no `App.tsx` modificam apenas o estado local (via `setCharacters`), sem realizar a chamada para a API (ex: `POST /api/campaigns/{id}/approve-character/{characterId}`). Se essas ações forem acionadas fora do `CampaignDMReview.tsx` (que possui as mutations corretas), as aprovações serão perdidas ao recarregar a página.
- **Recommendation:** Refatorar as funções `handleApproveCharacter` e `handleRejectCharacter` no `App.tsx` para utilizarem `useMutation` e chamarem os endpoints corretos da API, ou remover essa responsabilidade do `App.tsx` garantindo que toda aprovação/rejeição ocorra apenas através do componente `CampaignDMReview` (que já possui a implementação correta).

### WR-01: Antipadrão de Duplicação de Estado (React Query vs useState)
- **Severity:** Warning
- **File:** `frontend/src/App.tsx`
- **Description:** Os dados retornados pelo React Query (`serverCharacters` e `serverNotes`) estão sendo sincronizados em um estado local (`useState`) e no `localStorage` via `useEffect`. Como o `@tanstack/react-query` já gerencia o estado do servidor e possui mecanismos nativos de cache, essa duplicação gera múltiplas fontes de verdade e aumenta o risco de inconsistências e "race conditions".
- **Recommendation:** Remover o `useState` de `characters` e `notes` no `App.tsx`. Utilizar diretamente os dados fornecidos pelo `useQuery`. Para cache persistente, utilizar o plugin de persistência do React Query em vez de gerenciar o `localStorage` manualmente.

### WR-02: God Component (App.tsx com quase 1000 linhas)
- **Severity:** Warning
- **File:** `frontend/src/App.tsx`
- **Description:** O componente principal da aplicação centraliza diversas responsabilidades: lógica manual de roteamento (`pushState`/`popState`), múltiplas `useMutations` para entidades distintas (Personagens, Notas), sincronização de cache manual e a definição de todos os modais da UI.
- **Recommendation:** Extrair o roteamento para uma biblioteca dedicada (como `react-router-dom`) ou para um componente de roteamento isolado. Mover as lógicas de mutação (ex: `useCharacterMutations()`, `useNoteMutations()`) para hooks customizados (`hooks/`) separando regras de negócio da camada visual.

### IN-01: Armazenamento do Token JWT no LocalStorage
- **Severity:** Info
- **File:** `frontend/src/store/useAppStore.ts`
- **Description:** O JWT está sendo salvo via middleware `persist` do Zustand diretamente no `localStorage`. Embora funcional e comum em MVPs, isso deixa o token vulnerável a ataques de XSS (Cross-Site Scripting).
- **Recommendation:** Como melhoria futura para a segurança da plataforma, considerar a utilização de cookies `HttpOnly` para o armazenamento da sessão ou manter tokens de vida curta no client.
