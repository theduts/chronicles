# Convenções de Código e Estilo

## Convenções de Nomenclatura
- **Componentes React:** `PascalCase.tsx` (ex: `CharacterEditorView.tsx`, `Sidebar.tsx`).
- **Interfaces e Tipos TypeScript:** `PascalCase` em `src/types.ts` (ex: `Character`, `AttributeRow`, `SkillRow`, `Spell`, `Campaign`).
- **Funções e Variáveis:** `camelCase` (ex: `setActiveScreen`, `calculatePoints`, `handleSaveCharacter`).
- **Arquivos de Estilo e Configuração:** `kebab-case` ou `camelCase` (ex: `index.css`, `vite.config.ts`).

## Convenções de Domínio RPG (Sistema Daemon)
O vocabulário técnico do sistema Daemon é preservado diretamente no código e nos campos de dados:
- Atributos base: `CON`, `FR`/`FOR`, `DEX`/`DES`, `AGI`, `INT`, `WILL`, `PER`, `CAR`.
- Índices de Proteção (IP): `ipCinetico`, `ipBalistico`, `ipEscudo`, `ipPsiquico`, `ipMagico`.
- Magia Daemon: `criar`, `controlar`, `entender`, `caminhos`.
- Modos e Gêneros de Campanha: `arkanun`, `trevas`, `invasao`, `supers`, `fantasia`, `terror`, `scifi`, `cyberpunk`.

## Estilização e UI
- Uso ostensivo de Tailwind CSS v4 para layout e espaçamentos.
- Efeitos visuais modernos e dark mode com glassmorphism, gradientes e sombras sutis definidos em `index.css`.
- Animações fluidas com `motion` (Framer Motion).
- Ícone padrão: SVG via `lucide-react`.
