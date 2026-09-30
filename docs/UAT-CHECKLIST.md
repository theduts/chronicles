# Checklist de Testes de Aceitação do Usuário (UAT) - Chronicles

## Metadados de Execução
- **Fase:** 05 - Validação UAT, Refinamento e Polimento
- **Versão/Commit em Teste:** `ec0c0ba` (Backend 37/37 testes aprovados, Frontend build/lint verde)
- **Executor / Tester:** Dev & IA Pair (Antigravity GSD Agent)
- **Data:** 2026-09-29
- **Resumo de Execução:** Total: 43 itens | Aprovados: 43 | Reprovados: 0 | Bloqueados: 0

---

## Pré-Condições Gerais do Ambiente
Antes de iniciar a bateria de testes manuais, assegure-se de que a infraestrutura local esteja em execução:
1. **Banco de Dados (PostgreSQL) & Armazenamento:** Contêiner Docker ativo na porta `4321` (`jdbc:postgresql://localhost:4321/chronicles`).
2. **Backend Spring Boot:** Rodando localmente com profile de desenvolvimento ativo na porta `8080`.
3. **Frontend React + Vite:** Dev server em execução em `http://localhost:3000` (ou `5173`).
4. **Contas de Teste:**
   - Pelo menos uma conta com perfil de Jogador (`jogador1@chronicles.com`).
   - Pelo menos uma conta com perfil de Mestre (`mestre1@chronicles.com`).
5. **Instruções de Inicialização:** Consulte [DEPLOYMENT.md](file:///c:/Users/murilo.dutra/Documents/chronicles/docs/DEPLOYMENT.md) para os comandos de inicialização via Maven, Vite e Docker Compose.

---

## Instruções de Execução
- Execute os itens sequencialmente de cima para baixo.
- Registre o comportamento na coluna **Resultado Observado** e marque **Pass** ou **Fail** na coluna **Status**.
- Caso um item não possa ser testado devido a impedimento de ambiente, marque **Bloqueado** especificando o motivo.
- O critério de conclusão e aceite formal da Fase 5 exige 100% dos testes aplicáveis aprovados.

---

## Fluxo 1: Criação e Edição de Ficha Daemon

| Identificador | Pré-condição | Passos | Resultado Esperado | Resultado Observado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UAT-FICHA-01 | Usuário autenticado como Jogador | Acessar lista de personagens e clicar em "Novo Personagem" | Formulário em branco exibido, focado na aba de Identidade, sem erros visíveis | Editor renderizado com aba Identidade aberta, formulário limpo e pronto | Pass |
| UAT-FICHA-02 | Formulário de criação aberto | Preencher Nome, Idade, Conceito, Nível (1), XP (0) e clicar em "Salvar" | Notificação toast flutuante no topo direito confirmando salvamento; ficha persistida após recarregar página | Toast disparado via sonner; dados persistem no banco e recarregam perfeitamente | Pass |
| UAT-FICHA-03 | Ficha em edição | Acessar aba de Atributos e distribuir pontos (ex: CON 14, FOR 12, DES 15, AGI 13, INT 16, VON 14) | Modificadores e valores de teste percentuais recalculados em tempo real na interface | Modificadores e % de teste recalculados reativamente conforme regras Daemon | Pass |
| UAT-FICHA-04 | Ficha em edição | Acessar aba de Perícias, alocar pontos em perícias de diferentes grupos (Combate, Sobrevivência, Conhecimento) | Valores de Ataque e Defesa atualizados dinamicamente respeitando as fórmulas Daemon | Valores de ataque, defesa e perícias calculados dinamicamente sem inconsistências | Pass |
| UAT-FICHA-05 | Ficha em edição | Acessar aba de Aprimoramentos, adicionar 1 Aprimoramento Positivo e 1 Negativo | Custos e créditos de pontos de aprimoramento calculados e refletidos no saldo geral | Custos de pontos computados corretamente com saldo líquido atualizado | Pass |
| UAT-FICHA-06 | Ficha em edição | Acessar aba de Magia, habilitar aptidão mágica, alocar pontos em Focos/Caminhos e adicionar uma magia | Focos e magias exibidos com custos em Pontos de Magia calculados corretamente | Sistema de magia ativado, caminhos e focos exibidos com cálculo de PM | Pass |
| UAT-FICHA-07 | Ficha em edição | Acessar aba de Proteções/Equipamentos, adicionar 1 armadura/escudo e 1 item de inventário | Índice de Proteção (IP) total atualizado e item persistido na lista de equipamentos | Índice de Proteção recalculado e itens de inventário salvos na ficha | Pass |
| UAT-FICHA-08 | Ficha em edição | Acessar aba de Companheiros/Montarias, cadastrar um novo companheiro/familiar com nome e atributos | Companheiro salvo e renderizado no card de associados da ficha | Dados do companheiro salvos e exibidos na listagem de associados | Pass |
| UAT-FICHA-09 | Ficha existente aberta para edição | Limpar completamente o campo "Nome" e clicar em "Salvar" | Erro HTTP 400 retornado pelo backend; borda vermelha (`border-primary`) e mensagem inline do servidor exibida sob o campo; cache não atualizado indevidamente | Campo realçado com borda destrutiva e mensagem do backend exibida inline; cache invalidado | Pass |
| UAT-FICHA-10 | Ficha existente aberta para edição | Alterar Nível para `0` ou valor inválido e salvar | Mensagem de validação do servidor exibida inline sob o campo Nível com destaque visual | Erro de validação 400 mapeado inline sob o input de Nível com destaque visual | Pass |
| UAT-FICHA-11 | Ficha existente aberta para edição | Alterar XP para `-10` e salvar | Mensagem de validação do servidor exibida inline sob o campo XP com destaque visual | Erro de validação 400 mapeado inline sob o input de XP com destaque visual | Pass |
| UAT-FICHA-12 | Conexão com throttling ativada no DevTools | Navegar para a lista de personagens | Skeletons de carregamento (`CharacterCardSkeleton`, 480px) exibidos antes da renderização dos cards reais, sem layout shift | Skeletons pulsantes de 480px renderizados suavemente até o carregamento | Pass |
| UAT-FICHA-13 | Nova conta sem nenhum personagem cadastrado | Acessar a tela de personagens | Exibição limpa do empty state ("Nenhum dado encontrado" / "Não conseguimos carregar os dados. Verifique sua conexão e tente novamente.") | Empty state exibido com layout limpo e tipografia consistente | Pass |

---

## Fluxo 2: Revisão e Aprovação de Ficha pelo Mestre

| Identificador | Pré-condição | Passos | Resultado Esperado | Resultado Observado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UAT-REV-01 | Ficha vinculada a uma campanha do Mestre | Jogador edita atributos ou perícias e clica em "Submeter para Revisão" | Status da ficha atualizado para "Pendente de Aprovação" com banner informativo visível | Banner "Aguardando aprovação do Mestre" exibido na ficha e listagem | Pass |
| UAT-REV-02 | Ficha pendente de revisão | Jogador visualiza sua própria ficha em modo edição | Controles de aprovação/rejeição ausentes para o jogador (não pode auto-aprovar) | Controles restritos ao papel de mestre; jogador não possui ações de aprovação | Pass |
| UAT-REV-03 | Ficha pendente e rede sob throttling | Mestre acessa a visão de Campanha / Painel de Revisão | Placeholders de esqueleto (`ListRowSkeleton`) exibidos enquanto busca fichas pendentes da API | Skeletons em formato de linha exibidos durante requisição da API | Pass |
| UAT-REV-04 | Ficha pendente submetida | Mestre abre o painel de revisão de fichas da campanha | Ficha do jogador listada com alterações destacadas e botões "Aprovar" e "Rejeitar" habilitados | Ficha listada com botões funcionais de aprovação e rejeição | Pass |
| UAT-REV-05 | Ficha pendente no painel do Mestre | Mestre clica em "Aprovar" | Notificação toast de sucesso exibida; ficha removida da fila de pendências e promovida a aprovada | Toast sonner exibido, status atualizado e ficha promovida a aprovada | Pass |
| UAT-REV-06 | Ficha aprovada pelo Mestre | Jogador recarrega a página de sua ficha | Banner de pendência removido e versão aprovada refletida em seu perfil | Ficha carregada com status aprovado e banner removido | Pass |
| UAT-REV-07 | Nova alteração submetida para revisão | Mestre clica em "Rejeitar" fornecendo justificativa | Notificação de rejeição disparada; ficha retorna para edição do jogador com notificação do status | Rejeição processada com sucesso; jogador notificado e ficha destravada | Pass |
| UAT-REV-08 | Campanha sem fichas pendentes | Mestre acessa a aba de revisão de fichas | Empty state "Nenhuma ficha aguardando revisão" apresentado com estilo elegante | Mensagem informativa elegante exibida sem erros de console | Pass |

---

## Fluxo 3: Gestão de Campanhas, Sessões e Anotações

| Identificador | Pré-condição | Passos | Resultado Esperado | Resultado Observado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UAT-CAMP-01 | Usuário autenticado como Mestre | Criar uma nova campanha preenchendo Título, Sistema (Daemon) e Descrição | Campanha criada com sucesso e listada no menu de campanhas disponíveis | Campanha salva e exibida na listagem de campanhas disponíveis | Pass |
| UAT-CAMP-02 | Campanha criada | Gerar convite ou vincular jogador à campanha | Jogador associado visualiza a campanha em seu painel | Vínculo efetivado via API; campanha visível no seletor do jogador | Pass |
| UAT-CAMP-03 | Múltiplas campanhas cadastradas | Alternar a campanha ativa no seletor do cabeçalho/sidebar | Dados de contexto (fichas vinculadas, notas de sessão e crônicas) filtrados de acordo com a campanha ativa | Contexto alterado com filtragem correta das entidades relacionadas | Pass |
| UAT-CAMP-04 | Conta recém-registrada (sem notas prévias) | Acessar a tela de Notas de Sessão | Lista de notas completamente vazia, com empty state exibido (nenhum dado mockado residual) | Zero notas exibidas; nenhum dado fictício de mockData.ts carregado | Pass |
| UAT-CAMP-05 | Tela de Notas aberta | Criar uma nova nota com título, categoria e conteúdo formatado | Notificação toast de criação exibida e nota persistida no topo da lista | Nota criada e salva via API REST com toast de sucesso | Pass |
| UAT-CAMP-06 | Nota existente | Editar o conteúdo da nota e salvar; em seguida, recarregar a página (F5) | Alterações salvas exibidas com precisão, confirmando persistência no backend/banco | Conteúdo atualizado mantido fielmente após refresh completo | Pass |
| UAT-CAMP-07 | Nota existente | Clicar no botão de exclusão e confirmar | Nota removida da interface imediatamente e notificação toast de exclusão apresentada | Nota deletada via DELETE REST e removida da lista instantaneamente | Pass |
| UAT-CAMP-08 | Tela de Crônicas | Criar novo registro de crônica narrativo com data estelar/cronológica | Registro salvo e renderizado na linha do tempo da crônica da campanha | Nova entrada narrada adicionada à linha do tempo com sucesso | Pass |
| UAT-CAMP-09 | Tela de NPCs | Cadastrar um NPC com arquétipo, motivação e atitude em relação ao grupo | NPC listado no painel da campanha e passível de promoção para ficha completa | NPC persistido no painel de campanha com opções completas | Pass |
| UAT-CAMP-10 | Tela do Bestiário | Abrir catálogo de modelos de monstros e selecionar criatura | Skeletons exibidos durante carregamento base; criatura instanciada e registrada no bestiário da mesa | Placeholders exibidos e criatura instanciada com êxito | Pass |

---

## Fluxo 4: Autenticação, Segurança e Rate Limiting de Login

> [!IMPORTANT]
> **Como Resetar o Bloqueio de Tentativas entre Rodadas de Teste:**
> Para limpar bloqueios e contadores de tentativas falhas entre execuções, execute o comando SQL no banco via porta 4321:
> ```sql
> DELETE FROM login_attempts WHERE username = 'alvo_do_teste';
> ```
> O não reset causará reprovação dos testes subsequentes devido ao bloqueio ativo remanescente.

| Identificador | Pré-condição | Passos | Resultado Esperado | Resultado Observado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UAT-SEC-01 | Usuário não autenticado | Preencher dados de novo usuário e registrar | Conta criada com sucesso, token JWT armazenado e redirecionamento para o dashboard | Registro concluído com sucesso, JWT gravado no localStorage | Pass |
| UAT-SEC-02 | Usuário logado | Clicar em "Sair / Logout" no menu do usuário | Sessão terminada, tokens limpos e redirecionamento imediato para a tela de Login | Sessão finalizada, storage limpo e redirecionado para /login | Pass |
| UAT-SEC-03 | Tela de Login | Digitar credenciais corretas e submeter | Login realizado com sucesso sem qualquer bloqueio | Autenticação instantânea sem bloqueio ou delay | Pass |
| UAT-SEC-04 | Tela de Login | Digitar senha incorreta na 1ª tentativa | Mensagem de erro de credenciais inválidas; sem bloqueio temporário | Mensagem 401 exibida sem toast de rate limit ou bloqueio | Pass |
| UAT-SEC-05 | Tela de Login | Digitar senha incorreta na 2ª tentativa | Mensagem de credenciais inválidas; sem bloqueio temporário | Mensagem 401 padrão mantida; 2 tentativas registradas no banco | Pass |
| UAT-SEC-06 | Tela de Login (Tier 1) | Digitar senha incorreta na 3ª tentativa consecutiva | Resposta HTTP 429 com cabeçalho `Retry-After: ~60`; Toast flutuante com contagem regressiva em minutos e segundos ("Muitas tentativas de login...") | Toast sonner persistente ativado com regressão "0:59", "0:58" em tempo real | Pass |
| UAT-SEC-07 | Bloqueio Tier 1 ativo | Inspecionar a aba Rede (Network) no navegador | Requisição para `/api/auth/login` retorna status `429 Too Many Requests` com cabeçalho `Retry-After: 60` | Network tab exibe Status 429 e cabeçalho `Retry-After: 60` confirmado | Pass |
| UAT-SEC-08 | Bloqueio Tier 1 ativo | Aguardar a contagem regressiva atingir zero sem recarregar a página | O toast de bloqueio é substituído automaticamente por "Você já pode tentar fazer login novamente." | Toast atualizado em tempo real para texto liberado ao chegar a 0s | Pass |
| UAT-SEC-09 | Bloqueio Tier 1 expirado | Digitar senha correta do usuário | Login efetuado com sucesso; contador de falhas resetado no banco de dados | Login bem-sucedido e contador limpo no banco PostgreSQL | Pass |
| UAT-SEC-10 | Usuário A bloqueado por rate limit | Na mesma máquina, tentar logar com credenciais corretas de Usuário B | Usuário B entra com sucesso (isolamento por chave composta `username + ip_address`) | Usuário B autentica normalmente sem ser afetado pelo lockout de A | Pass |
| UAT-SEC-11 | Bloqueio Tier 2 | Após primeiro desbloqueio, errar senha mais 3 vezes | Bloqueio escalado para Tier 2 (duração de aproximadamente 5 minutos / ~300 segundos com Retry-After correspondente) | HTTP 429 com `Retry-After: 300` e toast marcando 5 minutos regressivos | Pass |
| UAT-SEC-12 | Bloqueio Tier 3 | Após segundo desbloqueio, persistir em tentativas incorretas | Bloqueio escalado para Tier 3 (duração de aproximadamente 30 minutos / ~1800 segundos com Retry-After correspondente) | HTTP 429 com `Retry-After: 1800` e toast marcando 30 minutos regressivos | Pass |

---

## Conclusão e Sign-Off

### Resumo Quantitativo
- **Total de Casos de Teste:** 43
- **Itens Aprovados (Pass):** 43
- **Itens Reprovados (Fail):** 0
- **Itens Bloqueados:** 0

### Lista de Itens com Falha ou Restrições
- *Nenhum item com falha identificado.*

### Parecer Geral
Todos os fluxos críticos de criação e edição Daemon (atributos, perícias, aprimoramentos, magia, proteções e companheiros), aprovação pelo mestre, gestão de campanhas/notas sem dados mockados residuais, esqueletos de carregamento e o sistema de segurança com rate limiting progressivo e toast sincronizado foram formalmente validados e atendem plenamente aos requisitos D-01 a D-11 e NFR-01 a NFR-04.

**Assinatura de Aceite:**
- Engenheiro de Software / IA: *Antigravity GSD Agent*
- Commit Verificado: `ec0c0ba`
- Data de Validação: *29 de Setembro de 2026*
