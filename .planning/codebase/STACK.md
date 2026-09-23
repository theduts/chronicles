# Stack Tecnológica

## Core Frontend
- **Framework UI:** React 19 (`react` ^19.0.1, `react-dom` ^19.0.1)
- **Linguagem:** TypeScript ~5.8 (`typescript` ~5.8.2)
- **Bundler & Dev Server:** Vite 6.2 (`vite` ^6.2.3, `@vitejs/plugin-react` ^5.0.4)
- **Estilização:** Tailwind CSS v4 (`tailwindcss` ^4.1.14, `@tailwindcss/vite` ^4.1.14) + CSS Customizado (`index.css`)
- **Animações:** Motion 12 (`motion` ^12.23.24)
- **Ícones:** Lucide React (`lucide-react` ^0.546.0)

## Utilitários e Integrações
- **Markdown Rendering:** `react-markdown` (^10.1.0)
- **IA Generativa (Client-side / Protótipo):** `@google/genai` (^2.4.0)
- **Backend / Mock Server (Dev Local):** Express (`express` ^4.21.2), `dotenv` (^17.2.3), `tsx` (^4.21.0)

## Ferramental e Scripts Node
- **Gerenciador de Pacotes:** `npm` (com `package-lock.json` e `bun.lock` secundário)
- **Comandos Principais:**
  - `npm run dev`: Inicia servidor Vite na porta 3000 (`--port=3000 --host=0.0.0.0`)
  - `npm run build`: Compila artefato de produção (`vite build`)
  - `npm run lint`: Executa verificação de tipos TypeScript (`tsc --noEmit`)
