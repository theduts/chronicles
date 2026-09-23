# Phase 1: Frontend Hygiene & Meta‑Harness Setup

## Objetivo
Limpar o código front‑end removendo scripts e testes desnecessários e criar a base de um meta‑harness (`.agents/`) com o guia `AGENTS.md` que define como usar o diretório `.planning/` para desenvolvimento limpo, seguro e inteligente.

## Tarefas (Execution Steps)

1. **Remover arquivos de depuração/utilidade**
   - Excluir todos os arquivos `*.cjs` localizados na pasta `frontend/` (ex: `fix_*.cjs`, `test_*.cjs`, `debug_*.cjs`, etc.). Estes foram usados apenas para refatorações anteriores e não fazem parte do código-fonte importado.

2. **Atualizar `package.json`**
   - Editar `frontend/package.json`.
   - Adicionar o script `"clean:frontend": "rm -rf dist server.js"` para manter a higiene. (O script de clean já existe, mas pode ser melhorado para algo genérico se necessário, ou apenas deixar o ambiente organizado).

3. **Criar Estrutura `.agents/`**
   - Criar a pasta `.agents/` na raiz do projeto (`chronicles/.agents/`).
   - Criar o arquivo `.agents/AGENTS.md`. Este documento deve conter orientações sobre como os agentes de IA devem interagir com o projeto, incluindo regras de desenvolvimento, workflow e boas práticas usando `.planning/`.

4. **Atualizar `.planning/README.md`**
   - Criar ou atualizar o arquivo `.planning/README.md`.
   - Incluir um apontamento claro para `.agents/AGENTS.md`, orientando agentes e desenvolvedores sobre a existência do meta-harness.

## Critérios de Aceite (Verification)
- [ ] A pasta `frontend/` não contém mais nenhum arquivo `.cjs`.
- [ ] `frontend/package.json` está limpo e scripts de utilidade antigos foram removidos se existirem.
- [ ] O arquivo `.agents/AGENTS.md` existe e possui diretrizes claras.
- [ ] `.planning/README.md` menciona a pasta `.agents/`.
