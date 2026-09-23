# Estrutura do Código Frontend

```
frontend/
├── index.html                  # HTML principal e container da SPA React (#root)
├── package.json                # Dependências, scripts npm (dev, build, lint, clean)
├── tsconfig.json               # Configurações do compilador TypeScript
├── vite.config.ts              # Configuração do bundler Vite e plugins (React, Tailwind)
├── metadata.json               # Metadados da aplicação AI Studio
├── src/
│   ├── main.tsx                # Ponto de entrada React (renderiza <App /> em StrictMode)
│   ├── App.tsx                 # Roteador principal, layout base e gestão de sessão
│   ├── types.ts                # Definição das interfaces TypeScript (Character, Campaign, etc.)
│   ├── mockData.ts             # Dados iniciais simulados para notas e fichas
│   ├── index.css               # Estilos globais CSS, tokens Tailwind e regras visuais
│   └── components/             # Componentes de UI e telas
│       ├── Sidebar.tsx         # Barra lateral de navegação
│       ├── AuthView.tsx        # Formulários de Login e Cadastro
│       ├── DashboardView.tsx   # Painel principal do Mestre/Jogador
│       ├── CharactersListView.tsx # Grade/Lista de Fichas de Personagem
│       ├── CharacterEditorView.tsx # Form de edição detalhado da ficha Daemon
│       ├── CampaignsView.tsx   # Gestão de Campanhas e Jogadores
│       ├── CampaignHistoryView.tsx # Histórico de Sessões e Diário
│       ├── ChroniclesView.tsx  # Visão detalhada de Crônicas e Lore
│       ├── NPCsView.tsx        # Fichas de NPCs da campanha
│       ├── BestiaryView.tsx    # Consulta de Monstros e Criaturas Daemon
│       ├── NotesView.tsx       # Bloco de Anotações Rápido
│       ├── SettingsView.tsx    # Configurações do Usuário e Perfil
│       ├── ActionButtons.tsx   # Componentes de botões de ação reutilizáveis
│       ├── ConfirmDeleteModal.tsx # Modal de confirmação de exclusão
│       ├── CustomSelect.tsx    # Componente de Select estilizado
│       ├── ImageWithFallback.tsx # Componente de imagem com tratamento de falhas
│       ├── Modal.tsx           # Modal Genérico reutilizável
│       └── Toggle.tsx          # Componente de chave de seleção (Switch)
```
