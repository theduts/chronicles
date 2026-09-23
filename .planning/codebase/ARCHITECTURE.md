# Arquitetura da Aplicação Frontend

## Padrão Arquitetural

A aplicação frontend é uma **Single Page Application (SPA)** construída com React 19, utilizando navegação baseada em rotas com sincronização com a `HTML5 History API` (`window.history.pushState` e evento `popstate`).

```
App.tsx (Roteamento, Autenticação, Estado Global)
  │
  ├── Sidebar.tsx (Menu lateral e navegação)
  │
  └── Visualizações (Views)
      ├── AuthView.tsx (Login / Cadastro)
      ├── DashboardView.tsx (História / Resumo do Jogador/Mestre)
      ├── CharactersListView.tsx (Listagem de Fichas)
      ├── CharacterEditorView.tsx (Edição Detalhada de Ficha Daemon)
      ├── CampaignsView.tsx (Gerenciamento de Campanhas)
      ├── CampaignHistoryView.tsx (Histórico de Sessões)
      ├── NPCsView.tsx & BestiaryView.tsx (NPCs e Monstros Daemon)
      ├── NotesView.tsx (Diário de Sessão)
      └── SettingsView.tsx (Configurações do Usuário)
```

## Roteamento Client-Side (`App.tsx`)

O roteamento é controlado via mapeamento bi-direcional:
- `ROUTE_MAP`: Associa URLs da aplicação (ex: `/personagens/editar`) para telas lógicas (`ActiveScreen`).
- `SCREEN_TO_ROUTE`: Converte nomes de telas lógicas para caminhos de URL.
- O componente `App` gerencia a tela ativa via `useState` e escuta `popstate` para suportar os botões de voltar/avançar do navegador.

## Gerenciamento de Estado

- **Estado de Sessão:** `user` (`{ name, email, role: 'player' | 'dm' }`) armazenado em `App.tsx` e sincronizado com `localStorage`.
- **Estado de Tela:** `activeScreenState` define qual visualização é renderizada no container principal.
- **Estado de Fichas e Campanhas:** Gerenciado centralmente e repassado como props para os componentes de visualização.

## Fluxo de Revisão do Mestre (`DM Review`)

1. Jogador altera campos de uma ficha em campanha ativa.
2. A ficha registra alterações pendentes com a flag `isPendingDMReview: true`.
3. Na visualização do Mestre (`DashboardView` / `CampaignsView`), as fichas com pendências são sinalizadas para aprovação ou rejeição.
