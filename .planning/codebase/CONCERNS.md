# Riscos Técnicos, Gargalos e Pontos de Atenção

## 1. Arquivos Monolíticos de Visualização
- **`CharacterEditorView.tsx` (796 KB)** e **`CampaignHistoryView.tsx` (134 KB)**:
  - São componentes extremamente extensos que concentram lógica de renderização, cálculo de regras Daemon, gerenciamento de formulários e estados locais.
  - **Recomendação:** Modularizar `CharacterEditorView.tsx` em subcomponentes isolados (`AttributeSection.tsx`, `SkillTree.tsx`, `SpellBook.tsx`, `EquipmentSection.tsx`).

## 2. Tipagem Híbrida (`number | string`)
- Na interface `types.ts`, diversos campos vitais (ex: `natural`, `penalidade`, `ouro`, `ipCinetico`) aceitam tanto `number` quanto `string` para facilitar os inputs no formulário.
- **Ponto de Atenção para o Backend Spring Boot:** Ao mapear para entidades JPA PostgreSQL, é necessário definir um contrato estrito de DTOs e conversores (ou utilizar tipos numéricos com fallback seguro para parsers).

## 3. Acoplamento a `localStorage`
- O estado de sessão, fichas e campanhas está desacoplado de uma API e usa `localStorage` diretamente.
- **Ação na Integração Full-Stack:** Substituir acessos diretos a `localStorage` por uma camada de serviço HTTP (`src/services/api.ts`) que consome os endpoints REST em Java + Spring Boot.

## 4. Cobertura de Testes Automatizados
- Não existem testes unitários configurados no frontend. Testes de regressão em formulários de ficha Daemon serão essenciais ao conectar à API.
