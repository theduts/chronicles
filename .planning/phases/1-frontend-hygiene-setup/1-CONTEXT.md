# Phase 1: Frontend Hygiene & Meta-Harness Setup

<domain>
Limpeza do código frontend (remoção de dead code, scripts .cjs e testes inúteis) e criação de um meta-harness inteligente em `.agents/` para avaliar e otimizar iterativamente o uso dos agentes.
</domain>

<canonical_refs>
- [.planning/PROJECT.md](../../PROJECT.md)
- [.planning/REQUIREMENTS.md](../../REQUIREMENTS.md)
</canonical_refs>

<decisions>
### Frontend Hygiene
- **Dead Code Deletion:** Identificar e excluir apenas os arquivos (como `.cjs` e testes desnecessários) que forem **dead code**, ou seja, que não estejam sendo utilizados pelo Vite no processo de compilação da aplicação.
- **Organização:** Arquivos restantes que são úteis devem ser organizados estruturalmente em uma pasta apropriada ou movidos para os diretórios corretos caso estejam mal posicionados.
- **Script `clean:frontend`:** Recomendação aplicada será um script robusto para resetar o ambiente local. Ele irá limpar a pasta de build (`dist/`) e as dependências (removendo `node_modules/` e refazendo instalação com `npm install`), utilizando comandos compatíveis (como `rimraf`).

### Meta-Harness Workflow (`.agents/AGENTS.md`)
A documentação a ser gerada deve arquitetar um fluxo altamente inteligente de auto-melhoria para os agentes:
1. **Traces de Execução:** Coletar histórico do raciocínio e execução do agente (como chegou no resultado, quantos passos levou, onde hesitou, onde errou/corrigiu e quanto custou).
2. **Evals de Coleta e Avaliação:** Rodar avaliações (evals) automáticas por cima dos traces para identificar padrões de falhas estruturais (ex: falhas ao modificar mais de N arquivos, ou ignorar regras de testes em 40% das vezes).
3. **Agentes Proposers:** Um tipo específico de agente que recebe os evals e propõe melhorias no próprio sistema/harness (como enxugar instruções, ajustar constraints, refazer tools ou criar novos checkpoints).
4. **Validação e Worktree Isolado:** Propostas de melhorias no sistema devem ser testadas num ambiente sandbox usando o `git worktree`. O agente roda tasks de referência nesse worktree; os evals são comparados com a baseline e a alteração recebe merge apenas se os resultados forem consistentes e superiores.
</decisions>
