-- =====================================================================
-- Chronicles RPG - Migration V3: Seed Official Bestiary (Daemon)
-- Total de criaturas oficiais catalogadas: 295
-- =====================================================================

INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Abelha-Gigante',
    'Monstro',
    20,
    3,
    '12 M',
    $ATTR${"CON": 20, "FOR": 15, "DEX": 5, "AGI": 15, "INT": 3, "WILL": 3, "PER": 15, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Agarrar", "descricao_habilidade": "Ao acertar o ataque com as patas dianteiras, não causa dano, mas prende a vítima até que ela seja bem-sucedida em um Teste de Força. Enquanto estiver presa, a vítima não pode atacar e sofre automaticamente uma mordida por turno, causando dano baseado na Força da abelha."}, {"habilidade": "Ferrão Venenoso", "descricao_habilidade": "Pode atacar com o ferrão do abdômen (1d3 + veneno). A vítima deve realizar um Teste de Resistência +1 (CON). Em caso de falha, morre; em caso de sucesso, sofre 3d6 de dano que ignora Armadura. Após usar esse ataque, a abelha perde o ferrão e morre algumas horas depois."}, {"habilidade": "Voo", "descricao_habilidade": "Pode voar com deslocamento de 12 metros."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Água-Viva',
    'Animal',
    15,
    1,
    '3 M',
    $ATTR${"CON": 15, "FOR": 15, "DEX": 7, "AGI": 7, "INT": 3, "WILL": 5, "PER": 5, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Tentáculos Venenosos", "descricao_habilidade": "Realiza até três ataques com os tentáculos (1d2 + veneno). O veneno varia entre 1d6 e 4d6 conforme a espécie. A vítima deve realizar um Teste de Resistência -1. Em caso de falha, sofre 3d6+1 de dano que ignora Armadura, além de receber -1 em todos os Testes pelas próximas horas. Em caso de sucesso, não sofre dano, mas ainda recebe -1 em todos os os Testes por meia hora."}, {"habilidade": "Invisibilidade Aquática", "descricao_habilidade": "Enquanto submersa, possui 95% de invisibilidade devido ao corpo transparente e gelatinoso. Detectá-la exige um Teste Difícil de Percepção."}, {"habilidade": "Ambiente Aquático", "descricao_habilidade": "Pode nadar com deslocamento de 3 metros."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ameba-Gigante',
    'Monstro',
    21,
    4,
    '',
    $ATTR${"CON": 22, "FOR": 17, "DEX": 7, "AGI": 17, "INT": 3, "WILL": 4, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pseudópodes", "descricao_habilidade": "Pode realizar até quatro ataques por turno com pseudópodes. Esses ataques não causam dano, mas a vítima atingida deve passar em um Teste de Força. Em caso de falha, é puxada para o interior da criatura."}, {"habilidade": "Engolfar", "descricao_habilidade": "Criaturas presas em seu interior não conseguem respirar e sofrem 1 ponto de dano por turno causado pelo citoplasma ácido. Esse dano ignora Armadura."}, {"habilidade": "Núcleo Vital", "descricao_habilidade": "O núcleo é o único ponto vulnerável da criatura. Qualquer dano causado ao núcleo destrói imediatamente a ameba. O núcleo possui IP 8 e normalmente só pode ser atingido por ataques à distância; ataques corpo a corpo só podem alcançá-lo por criaturas que estejam dentro da ameba."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Anão',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Infravisão", "descricao_habilidade": "Enxerga naturalmente no escuro por viver em ambientes subterrâneos."}, {"habilidade": "Resistência à Magia", "descricao_habilidade": "Possui resistência natural contra efeitos mágicos."}, {"habilidade": "Resistência Superior", "descricao_habilidade": "Recebe +1 em todos os Testes de Resistência."}, {"habilidade": "Segredo Subterrâneo", "descricao_habilidade": "Tentativas de descobrir magicamente a localização do reino subterrâneo provocam automaticamente um Contra-Ataque Mental contra o conjurador."}, {"habilidade": "Inimigo Tradicional", "descricao_habilidade": "Escolhe um entre orcs, goblinóides ou trolls. Recebe +1 em Habilidade ao lutar contra o grupo escolhido."}, {"habilidade": "Longevidade", "descricao_habilidade": "Vive cerca de 200 anos. Efeitos de envelhecimento têm apenas um terço da eficácia normal."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Aparição',
    'Espírito',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 15, "WILL": 15, "PER": 15, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Possessão", "descricao_habilidade": "Pode possuir uma vítima para concluir seus objetivos. Dependendo da aparição, a possessão pode ser sutil, manipulando a vítima sem que ela perceba, ou total, assumindo completamente seu corpo e mente."}, {"habilidade": "Manifestação Sobrenatural", "descricao_habilidade": "Sua aparência causa medo e geralmente reproduz os sinais de sua morte. Algumas aparições podem provocar nas criaturas próximas as sensações relacionadas à forma como morreram."}, {"habilidade": "Comunicação Espiritual", "descricao_habilidade": "Algumas aparições tentam conversar ou pedir ajuda antes de recorrer à possessão."}, {"habilidade": "Levitação", "descricao_habilidade": "Move-se flutuando, sem necessidade de contato com o solo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Aranha-de-Teia',
    'Monstro',
    12,
    2,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 0, "AGI": 12, "INT": 0, "WILL": 0, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Teia", "descricao_habilidade": "Constrói teias extremamente resistentes e quase invisíveis. Detectá-las exige um Teste de Habilidade -1 (+2 caso a vítima possua Visão Aguçada). Uma criatura presa deve passar em um Teste de Força para se libertar, podendo tentar novamente a cada turno."}, {"habilidade": "Disparo de Teia", "descricao_habilidade": "Pode lançar teia à distância para prender uma vítima, funcionando como Paralisia."}, {"habilidade": "Picada Paralisante", "descricao_habilidade": "Sua mordida injeta um veneno que exige um Teste de Resistência por turno. Em caso de falha, a vítima fica paralisada por até duas semanas ou até receber magia ou poção de cura."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Aranha-Errante',
    'Monstro',
    22,
    3,
    '',
    $ATTR${"CON": 17, "FOR": 17, "DEX": 0, "AGI": 12, "INT": 0, "WILL": 0, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "(1d3 + veneno). Possui cerca de 90% de camuflagem quando imóvel em seu habitat."}, {"habilidade": "Camuflagem Natural", "descricao_habilidade": "Mistura-se perfeitamente a rochas, areia ou vegetação, tornando-se praticamente invisível. Essa camuflagem não é revelada por Infravisão, Ver o Invisível ou Radar. Apenas criaturas com Visão Aguçada podem tentar percebê-la."}, {"habilidade": "Ataque de Emboscada", "descricao_habilidade": "Caso não seja detectada, realiza um ataque gratuito antes do início do combate."}, {"habilidade": "Veneno Digestivo", "descricao_habilidade": "Além do dano normal da mordida, a vítima deve realizar um Teste de Resistência. Em caso de falha, sofre 3d6 de dano adicional que ignora Armadura."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Arraia',
    'Animal',
    12,
    2,
    '5 M',
    $ATTR${"CON": 12, "FOR": 7, "DEX": 0, "AGI": 12, "INT": 1, "WILL": 1, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ferrão Venenoso", "descricao_habilidade": "Realiza um ataque com o ferrão da cauda, causando 1d3 de dano. Após uma hora, a vítima deve realizar um Teste de Resistência. Em caso de falha, sofre 2d6 de dano causado pelo veneno."}, {"habilidade": "Camuflagem", "descricao_habilidade": "Quando permanece no fundo do mar, possui cerca de 80% de camuflagem, equivalente à Invisibilidade em seu ambiente natural."}, {"habilidade": "Natação", "descricao_habilidade": "Pode nadar com deslocamento de 5 metros."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Asa-Assassina',
    'Monstro',
    10,
    1,
    '15 M',
    $ATTR${"CON": 6, "FOR": 6, "DEX": 2, "AGI": 7, "INT": 1, "WILL": 1, "PER": 12, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Asas Afiadas", "descricao_habilidade": "Ataca com as asas cortantes, causando 1d10 de dano."}, {"habilidade": "Ataque Furtivo", "descricao_habilidade": "A vítima é surpreendida, a menos que perceba sua aproximação com um Teste de Habilidade -3 ou Habilidade +1 caso possua Sentidos Especiais apropriados."}, {"habilidade": "Vorpal", "descricao_habilidade": "Se obtiver resultado 1 no Teste de Habilidade ao atacar, a vítima deve realizar um Teste de Armadura. Em caso de falha, é decapitada e morre instantaneamente."}, {"habilidade": "Voo", "descricao_habilidade": "Pode voar com deslocamento de 15 metros."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Asa-Negra',
    'Animal',
    7,
    0,
    '25 M',
    $ATTR${"CON": 6, "FOR": 7, "DEX": 5, "AGI": 9, "INT": 3, "WILL": 3, "PER": 22, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Bico", "descricao_habilidade": "Realiza um ataque com o bico, causando 1d3 de dano."}, {"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques com as garras, cada um causando 1d3+1 de dano."}, {"habilidade": "Camuflagem Noturna", "descricao_habilidade": "Sua plumagem negra a torna quase invisível durante a noite."}, {"habilidade": "Voo", "descricao_habilidade": "Pode voar com deslocamento de 25 metros."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Asfixor',
    'Animal',
    25,
    0,
    '',
    $ATTR${"CON": 17, "FOR": 15, "DEX": 0, "AGI": 7, "INT": 2, "WILL": 2, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Abraço Asfixiante", "descricao_habilidade": "Ao cair sobre a vítima ou envolver seu corpo, acerta automaticamente. A criatura sofre 1d6 de dano por rodada, ignorando Armadura."}, {"habilidade": "Constrição", "descricao_habilidade": "Uma vítima aprisionada deve passar em um Teste de Força para conseguir atacar. Mesmo em caso de sucesso, só pode utilizar armas pequenas, causando no máximo 1d6 de dano."}, {"habilidade": "Escudo Vivo", "descricao_habilidade": "Ataques realizados por outras criaturas contra o Asfixor causam metade do dano também à vítima aprisionada."}, {"habilidade": "Camuflagem", "descricao_habilidade": "Pode alterar sua coloração para ficar quase invisível em masmorras abandonadas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Assassino da Savana',
    'Monstro',
    32,
    5,
    '',
    $ATTR${"CON": 22, "FOR": 27, "DEX": 5, "AGI": 16, "INT": 7, "WILL": 7, "PER": 16, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza quatro ataques com as garras, causando 1d6+5 de dano cada."}, {"habilidade": "Mordida", "descricao_habilidade": "Realiza um ataque de mordida causando 2d6 de dano."}, {"habilidade": "Múltiplos Ataques", "descricao_habilidade": "Pode realizar até cinco ataques por turno."}, {"habilidade": "Camuflagem", "descricao_habilidade": "Mistura-se facilmente à vegetação alta da savana, aguardando o momento ideal para atacar."}, {"habilidade": "Velocidade Extrema", "descricao_habilidade": "Em campo aberto pode atingir cerca de 160 km/h, sendo um dos animais mais rápidos existentes."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Assustador',
    'Animal',
    35,
    6,
    '',
    $ATTR${"CON": 22, "FOR": 25, "DEX": 5, "AGI": 7, "INT": 3, "WILL": 5, "PER": 10, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pinças", "descricao_habilidade": "Realiza dois ataques com as pinças dianteiras, causando 1d6+4 de dano cada."}, {"habilidade": "Cauda", "descricao_habilidade": "Ataca com a pinça localizada na extremidade da cauda, causando 2d6+4 de dano e alcançando inimigos distantes graças aos Membros Elásticos."}, {"habilidade": "Mordidas", "descricao_habilidade": "Após revelar suas cabeças ocultas, realiza dois ataques de mordida, causando 1d10 de dano cada."}, {"habilidade": "Transformação", "descricao_habilidade": "Ao sofrer pelo menos 1 ponto de dano, revela duas cabeças de dragão escondidas. Nessa forma pode realizar até cinco ataques por turno."}, {"habilidade": "Membros Elásticos", "descricao_habilidade": "Os pescoços e a cauda podem se estender para atingir alvos a longa distância."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Avatar',
    'Espírito',
    75,
    12,
    '',
    $ATTR${"CON": 45, "FOR": 42, "DEX": 32, "AGI": 32, "INT": 32, "WILL": 35, "PER": 32, "CAR": 25}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Arma Divina", "descricao_habilidade": "Empunha uma arma sagrada relacionada ao deus que representa, causando 3d10+10 de dano. A arma possui propriedades especiais como Ataque Especial, Retornável, Sagrada, Veloz e Vorpal, conforme a divindade."}, {"habilidade": "Magias e Rituais Divinos", "descricao_habilidade": "Possui todas as magias, rituais e Pontos de Fé apropriados ao deus representado. Não consome Pontos de Vida ou Pontos de Magia para conjurar magias."}, {"habilidade": "Aura Divina", "descricao_habilidade": "Quando revela sua identidade, todos os clérigos, paladinos e servos da mesma divindade recebem +1 em todos os testes enquanto permanecerem em sua presença."}, {"habilidade": "Milagres", "descricao_habilidade": "Pode curar ferimentos, remover maldições e ressuscitar mortos livremente."}, {"habilidade": "Presença Esmagadora", "descricao_habilidade": "Inimigos da divindade com Resistência baixa ficam paralisados ou fogem por uma hora ao contemplar o avatar. Criaturas mais resistentes podem tentar um Teste de Resistência para ignorar esse efeito."}, {"habilidade": "Identidade Oculta", "descricao_habilidade": "Sua verdadeira natureza não pode ser descoberta por meios mundanos ou mágicos, a menos que o próprio avatar deseje."}, {"habilidade": "Poderes da Divindade", "descricao_habilidade": "Cada avatar possui poderes exclusivos que refletem as características do deus que representa."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Baleia',
    'Animal',
    100,
    5,
    '',
    $ATTR${"CON": 50, "FOR": 60, "DEX": 3, "AGI": 11, "INT": 2, "WILL": 2, "PER": 18, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pancada com o Corpo", "descricao_habilidade": "Golpeia o alvo com todo o peso do corpo, causando 5d6+10 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Banshee',
    'Morto-Vivo',
    30,
    0,
    '',
    $ATTR${"CON": 17, "FOR": 9, "DEX": 13, "AGI": 11, "INT": 13, "WILL": 17, "PER": 16, "CAR": 14}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Grito Estridente", "descricao_habilidade": "Causa 2d6 de dano a todas as criaturas em um raio de 15 metros uma vez a cada três rodadas."}, {"habilidade": "Grito Devastador", "descricao_habilidade": "Uma vez por dia pode emitir um grito que causa 7d6 de dano, ignorando IP, a todas as criaturas em um raio de 20 metros."}, {"habilidade": "Grito de Pânico", "descricao_habilidade": "Seu grito pode provocar medo em um raio de até 1 km. As vítimas realizam o Teste de Resistência com penalidade de -2."}, {"habilidade": "Grito do Coma", "descricao_habilidade": "Pode colocar uma criatura em coma. A vítima realiza um Teste de Resistência; em caso de falha, somente outro grito da própria Banshee pode despertá-la."}, {"habilidade": "Intangibilidade", "descricao_habilidade": "Pode tornar-se intangível por algumas rodadas, permanecendo apenas no plano espiritual."}, {"habilidade": "Levitação", "descricao_habilidade": "Move-se levitando lentamente."}, {"habilidade": "Possessão", "descricao_habilidade": "Pode possuir o corpo de outras criaturas, como outros fantasmas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Basilisco',
    'Monstro',
    30,
    3,
    '',
    $ATTR${"CON": 18, "FOR": 16, "DEX": 3, "AGI": 13, "INT": 4, "WILL": 4, "PER": 12, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Realiza uma mordida causando 1d6 de dano."}, {"habilidade": "Olhar Petrificante", "descricao_habilidade": "Pode petrificar criaturas vivas apenas pelo contato visual. A vítima realiza um Teste de Resistência para evitar o efeito. Cada alvo só pode ser afetado uma vez."}, {"habilidade": "Saliva Ácida", "descricao_habilidade": "Cospe saliva ácida até 8 metros de distância, causando 2d6 de dano. Pode ser utilizada uma vez a cada cinco rodadas."}, {"habilidade": "Corrida sobre a Água", "descricao_habilidade": "Graças às patas membranosas, consegue correr sobre a superfície da água."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Beijo-da-noite',
    'Monstro',
    1,
    0,
    '',
    $ATTR${"CON": 1, "FOR": 0, "DEX": 10, "AGI": 10, "INT": 0, "WILL": 0, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Veneno Mortal", "descricao_habilidade": "A picada não causa dano imediato nem costuma ser percebida. A vítima deve realizar um Teste de Resistência; em caso de falha, morre durante o próximo sono. O veneno pode ser removido por magia de cura ou efeitos semelhantes."}, {"habilidade": "Picada Furtiva", "descricao_habilidade": "Procura frestas em armaduras e regiões desprotegidas do corpo para atacar, ignorando a proteção da armadura."}, {"habilidade": "Camuflagem nas Sombras", "descricao_habilidade": "Em ambientes escuros, apenas criaturas com Sentidos Especiais podem tentar percebê-la através de um Teste Difícil de Percepção."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Besouro do Sol',
    'Monstro',
    2,
    5,
    '',
    $ATTR${"CON": 2, "FOR": 3, "DEX": 1, "AGI": 10, "INT": 0, "WILL": 1, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mandíbulas Poderosas", "descricao_habilidade": "Ataca com suas mandíbulas causando 1d3 de dano. Sua mordida é capaz de cortar madeira e metais pouco resistentes."}, {"habilidade": "Regeneração Solar", "descricao_habilidade": "Recupera seus Pontos de Vida quando exposto à luz."}, {"habilidade": "Hibernação Petrificada", "descricao_habilidade": "Na ausência de alimento ou umidade, transforma-se em uma carapaça petrificada semelhante a uma joia negra, podendo permanecer assim por tempo indefinido."}, {"habilidade": "Sentinela das Tumbas", "descricao_habilidade": "Desperta ao detectar calor, umidade da respiração ou movimentação intensa, atacando invasores automaticamente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Besouro-do-Fogo',
    'Monstro',
    5,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 5, "DEX": 0, "AGI": 10, "INT": 1, "WILL": 1, "PER": 5, "CAR": 1}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Ferrão", "descricao_habilidade": "Ataca utilizando seus ferrões caso seja irritado."}, {"habilidade": "Líquido Inflamável", "descricao_habilidade": "Em casos extremos, expele um líquido inflamável incendiado com o movimento das antenas, causando 2d6 de dano por fogo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Besouro-do-Óleo',
    'Monstro',
    65,
    9,
    '',
    $ATTR${"CON": 42, "FOR": 42, "DEX": 5, "AGI": 12, "INT": 5, "WILL": 10, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mandíbulas", "descricao_habilidade": "Realiza um ataque com suas mandíbulas, causando 3d6+6 de dano físico."}, {"habilidade": "Pisada em Área", "descricao_habilidade": "Realiza uma pisada sobre uma área, causando 1d10 de dano."}, {"habilidade": "Rajada de Ácido Flamejante", "descricao_habilidade": "Até 6 vezes ao dia, pode disparar uma rajada de substância cáustica em até 10m de distância que causa 6d6+6 de dano de fogo/ácido. Uma esquiva reduz o dano à metade. Ignora qualquer proteção ou resistência contra Magia, ignora Reflexão/Deflexão e afeta criaturas vulneráveis apenas à Magia."}, {"habilidade": "Rajada Destruidora Desesperada", "descricao_habilidade": "Em caso de grande perigo, pode disparar uma única rajada concentrada que causa 10d6 de dano de fogo/ácido."}, {"habilidade": "Couraça Cáustica", "descricao_habilidade": "Sua couraça é revestida por um muco composto pela enzima cáustica. Tocar o besouro com a pele desprotegida provoca 2d6 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Brownie',
    'Fada',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Proteção Mágica", "descricao_habilidade": "Pode utilizar Proteção Mágica como habilidade natural, sem gastar Pontos de Vida ou Pontos de Magia. Pode ser usada uma vez por dia com duração máxima de uma hora."}, {"habilidade": "Luz", "descricao_habilidade": "Pode utilizar Luz como habilidade natural, sem gastar Pontos de Vida ou Pontos de Magia. Pode ser usada uma vez por dia com duração máxima de uma hora."}, {"habilidade": "Ilusão Avançada", "descricao_habilidade": "Pode utilizar Ilusão Avançada como habilidade natural, sem gastar Pontos de Vida ou Pontos de Magia. Pode ser usada uma vez por dia com duração máxima de uma hora."}, {"habilidade": "Imagem Turva", "descricao_habilidade": "Pode utilizar Imagem Turva como habilidade natural, sem gastar Pontos de Vida ou Pontos de Magia. Pode ser usada uma vez por dia com duração máxima de uma hora."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Bruxas',
    'Humanoide',
    35,
    5,
    '',
    $ATTR${"CON": 18, "FOR": 20, "DEX": 11, "AGI": 11, "INT": 17, "WILL": 18, "PER": 17, "CAR": 4}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Adaga Ritualística", "descricao_habilidade": "Realiza um ataque com sua adaga, causando 1d6+6 de dano."}, {"habilidade": "Garras", "descricao_habilidade": "Realiza um ataque com suas garras, causando 1d6+4 de dano físico."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Bruxas Fúrias',
    'Humanoide',
    45,
    5,
    '',
    $ATTR${"CON": 28, "FOR": 24, "DEX": 11, "AGI": 11, "INT": 27, "WILL": 22, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Adaga Ritualística", "descricao_habilidade": "Realiza um ataque com sua adaga ritualística, causando 1d6+11 de dano."}, {"habilidade": "Mordida", "descricao_habilidade": "Realiza um ataque de mordida, causando 1d3+4 de dano físico."}, {"habilidade": "Garras Duplas", "descricao_habilidade": "Realiza até dois ataques de garras em uma rodada, causando 1d6+11 de dano por ataque."}, {"habilidade": "Detectar a Verdade", "descricao_habilidade": "Capacidade mística de saber se uma pessoa está falando a verdade."}, {"habilidade": "Ilusão de Jovem", "descricao_habilidade": "Pode transformar-se temporariamente em uma linda jovem para atrair suas vítimas, assumindo Carisma 18 nesta forma."}, {"habilidade": "Leitura de Passado", "descricao_habilidade": "Capacidade de ler o passado de uma pessoa ou de um objeto."}, {"habilidade": "Comunhão com Espíritos", "descricao_habilidade": "Permite falar com espíritos e conversar através de sonhos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Canário-do-Sono',
    'Monstro',
    1,
    0,
    '',
    $ATTR${"CON": 1, "FOR": 1, "DEX": 3, "AGI": 10, "INT": 2, "WILL": 2, "PER": 15, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Levitação", "descricao_habilidade": "A criatura possui a capacidade de flutuar e se movimentar no ar constantemente."}, {"habilidade": "Canto Adormecedor", "descricao_habilidade": "O canto induz os ouvintes a uma sonolência profunda. Vítimas que ouvirem a canção por mais de 3 turnos e falharem em um teste de Resistência +1 (+10%) caem em um sono mágico por 1 hora, não podendo despertar mesmo se sofrerem dano. Mortos-vivos, constructos, criaturas mágicas, seres não-vivos ou criaturas com Resistência 4 ou Constituição de 5d6 ou mais são imunes."}, {"habilidade": "Alimentação Coletiva", "descricao_habilidade": "Assim que a vítima adormece, o bando pousa para atacá-la. Um bando médio (uma dúzia) causa 1 ponto de dano a cada 10 minutos diretamente nos PVs da vítima, sem direito a absorção por Armadura ou IP. Bandos duas vezes maiores causam 2 pontos a cada 10 minutos, escalando proporcionalmente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Canceronte',
    'Monstro',
    21,
    1,
    '',
    $ATTR${"CON": 14, "FOR": 16, "DEX": 3, "AGI": 7, "INT": 3, "WILL": 3, "PER": 5, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Anfíbio", "descricao_habilidade": "A criatura é capaz de respirar e se mover livremente tanto na água quanto na terra."}, {"habilidade": "Ataque com Garras", "descricao_habilidade": "A criatura possui duas garras e pode realizar até dois ataques por turno utilizando-as. O dano é baseado em sua Força (1d6+2)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Carniceiros',
    'Monstro',
    3,
    0,
    '',
    $ATTR${"CON": 3, "FOR": 3, "DEX": 3, "AGI": 10, "INT": 3, "WILL": 3, "PER": 8, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Levitação", "descricao_habilidade": "A criatura possui a capacidade de flutuar e se movimentar no ar constantemente."}, {"habilidade": "Bicada", "descricao_habilidade": "Ataque físico realizado com o bico, causando 1d2 de dano."}, {"habilidade": "Ataque com Garras", "descricao_habilidade": "Ataque físico complementar realizado com as garras."}, {"habilidade": "Caçador de Mortos-Vivos", "descricao_habilidade": "As garras e o bico da criatura conseguem ferir mortos-vivos normalmente, mesmo aqueles que possuem vulnerabilidade apenas a armas mágicas e Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Carrasco dda Cura',
    'Monstro',
    20,
    2,
    '',
    $ATTR${"CON": 18, "FOR": 18, "DEX": 10, "AGI": 11, "INT": 5, "WILL": 5, "PER": 13, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Membros Elásticos", "descricao_habilidade": "A criatura estica seus membros ou apêndices para realizar ataques à distância."}, {"habilidade": "Chicotada de Tentáculo", "descricao_habilidade": "Ataque realizado através de um tentáculo espinhoso que nasce em sua crista cefálica, funcionando mecanicamente como uma maça-estrela. Causa 1d6+3 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cavalo de Montaria',
    'Animal',
    25,
    0,
    '30 M',
    $ATTR${"CON": 30, "FOR": 30, "DEX": 0, "AGI": 10, "INT": 3, "WILL": 3, "PER": 20, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Aceleração", "descricao_habilidade": "A criatura é capaz de aumentar rapidamente sua velocidade de movimentação."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico realizado com as mandíbulas que causa 1d3 de dano."}, {"habilidade": "Coice", "descricao_habilidade": "Ataque físico realizado com os cascos traseiros que causa 2d6+5 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cavalo de Carga',
    'Animal',
    25,
    0,
    '5 M',
    $ATTR${"CON": 30, "FOR": 35, "DEX": 0, "AGI": 6, "INT": 3, "WILL": 3, "PER": 15, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico realizado com as mandíbulas que causa 1d3 de dano."}, {"habilidade": "Coice", "descricao_habilidade": "Ataque físico realizado com os cascos traseiros que causa 2d6+5 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cavalo de Guerra',
    'Animal',
    35,
    0,
    '30 M',
    $ATTR${"CON": 30, "FOR": 30, "DEX": 0, "AGI": 10, "INT": 3, "WILL": 3, "PER": 20, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Aceleração", "descricao_habilidade": "A criatura é capaz de aumentar rapidamente sua velocidade de movimentação."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico realizado com as mandíbulas que causa 1d3 de dano."}, {"habilidade": "Coice", "descricao_habilidade": "Ataque físico realizado com os cascos traseiros que causa 2d6+6 de dano."}, {"habilidade": "Combate de Montaria", "descricao_habilidade": "O cavalo é treinado para o combate e pode realizar até dois ataques por turno utilizando os cascos. O cavaleiro não pode atacar no mesmo turno em que o animal faz isso, exceto se possuir perícias próprias e for bem-sucedido nos testes."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cavalo-Glacial',
    'Animal',
    32,
    1,
    '',
    $ATTR${"CON": 26, "FOR": 26, "DEX": 3, "AGI": 13, "INT": 5, "WILL": 5, "PER": 14, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Anfíbio", "descricao_habilidade": "A criatura é capaz de se mover e agir com a mesma eficiência tanto em terra firme quanto em ambientes aquáticos."}, {"habilidade": "Ataque com Patas", "descricao_habilidade": "A criatura pode realizar até dois ataques por turno utilizando suas patas dianteiras, infligindo 1d6+4 de dano por impacto."}, {"habilidade": "Prender o Fôlego", "descricao_habilidade": "Sendo um mamífero que necessita de oxigênio, a criatura possui uma capacidade pulmonar adaptada que permite reter o fôlego por até trinta minutos sob a água."}, {"habilidade": "Armadura Extra: Frio/Gelo", "descricao_habilidade": "A espessa camada de gordura sob o couro confere à criatura uma resistência extrema contra o frio e climas glaciais."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cavalo-Marinho',
    'Animal',
    15,
    2,
    '',
    $ATTR${"CON": 12, "FOR": 12, "DEX": 2, "AGI": 14, "INT": 4, "WILL": 5, "PER": 15, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Aceleração", "descricao_habilidade": "A criatura consegue aumentar subitamente seu ritmo de nado por curtos períodos."}, {"habilidade": "Ataque com Cauda", "descricao_habilidade": "Utiliza sua longa cauda preênsil para desferir chicotadas que causam 1d3+1 de dano físico."}, {"habilidade": "Camuflagem de Recife", "descricao_habilidade": "A criatura é capaz de alterar a coloração de sua pele para mimetizar o ambiente ao seu redor. Quando está em meio a recifes de corais ou plantas submarinas, esta habilidade concede os mesmos benefícios mecânicos de Invisibilidade."}, {"habilidade": "Olhos Independentes", "descricao_habilidade": "Seus olhos saltados movem-se de forma totalmente independente, permitindo observar direções diferentes simultaneamente e ampliando seu campo de visão."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Centauro Caçador',
    'Humanoide',
    18,
    1,
    '',
    $ATTR${"CON": 15, "FOR": 15, "DEX": 11, "AGI": 11, "INT": 11, "WILL": 11, "PER": 11, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Lança", "descricao_habilidade": "Ataque corpo a corpo ou à distância utilizando uma lança, causando 1d10+1 de dano."}, {"habilidade": "Ataques com Patas", "descricao_habilidade": "Pode realizar dois ataques extras por rodada utilizando os cascos, causando 1d6 de dano baseado em Força. Este dano é fixo e não pode ser aumentado por vantagens ou manobras."}, {"habilidade": "Força Inferior", "descricao_habilidade": "Recebe bônus de +1 (+10%) em todos os testes de Força que envolvam a metade inferior do corpo, como empurrar, puxar ou carregar peso (exceto ataques com cascos)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Centauro Líder',
    'Humanoide',
    33,
    3,
    '',
    $ATTR${"CON": 19, "FOR": 19, "DEX": 16, "AGI": 15, "INT": 15, "WILL": 15, "PER": 15, "CAR": 13}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Lança", "descricao_habilidade": "Ataque utilizando uma lança com força aprimorada, causando 1d10+3 de dano."}, {"habilidade": "Ataques com Patas", "descricao_habilidade": "Pode realizar dois ataques extras por rodada utilizando os cascos, causando 1d6+1 de dano baseado em Força. Este dano é fixo e não pode ser aumentado por vantagens ou manobras."}, {"habilidade": "Força Inferior", "descricao_habilidade": "Recebe bônus de +1 (+10%) em todos os testes de Força que envolvam a metade inferior do corpo, como empurrar, puxar ou carregar peso (exceto ataques com cascos)."}, {"habilidade": "Energia Extra I", "descricao_habilidade": "Capacidade mecânica que permite recuperar forças ou estender o fôlego em combate."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Centauro Xamã',
    'Humanoide',
    33,
    3,
    '',
    $ATTR${"CON": 16, "FOR": 15, "DEX": 14, "AGI": 14, "INT": 16, "WILL": 15, "PER": 15, "CAR": 13}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Cajado", "descricao_habilidade": "Ataque utilizando um cajado místico, causando 1d6 de dano."}, {"habilidade": "Ataques com Patas", "descricao_habilidade": "Pode realizar dois ataques extras por rodada utilizando os cascos, causando 1d6+1 de dano baseado em Força. Este dano é fixo e não pode ser aumentado por vantagens ou manobras."}, {"habilidade": "Força Inferior", "descricao_habilidade": "Recebe bônus de +1 (+10%) em todos os testes de Força que envolvam a metade inferior do corpo, como empurrar, puxar ou carregar peso (exceto ataques com cascos)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Centopéia-Gigante',
    'Monstro',
    22,
    3,
    '',
    $ATTR${"CON": 21, "FOR": 21, "DEX": 2, "AGI": 13, "INT": 3, "WILL": 3, "PER": 11, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida Venenosa", "descricao_habilidade": "Ataque corpo a corpo que causa dano por Força e injeta veneno. A vítima deve fazer um Teste de Resistência; em caso de falha, sofre mais 1d6 pontos de dano e recebe um redutor de -1 (-10%) em todos os seus testes pelas próximas horas. Se for bem-sucedida no teste, o redutor de -1 dura apenas meia hora."}, {"habilidade": "Golpe com o Corpo", "descricao_habilidade": "Ataque físico utilizado apenas pelos espécimes maiores, causando 2d6 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ceratops',
    'Humanoide',
    35,
    2,
    '',
    $ATTR${"CON": 27, "FOR": 27, "DEX": 7, "AGI": 10, "INT": 10, "WILL": 10, "PER": 10, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Chifres", "descricao_habilidade": "Ataque que causa de 1d10 a 3d10 pontos de dano, variando conforme o tamanho e quantidade de chifres do espécime."}, {"habilidade": "Ataque com Garras", "descricao_habilidade": "Ataque corpo a corpo que causa 1d6 pontos de dano somado ao bônus de Força da criatura."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cocatriz',
    'Monstro',
    10,
    0,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 3, "AGI": 7, "INT": 3, "WILL": 5, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Bicada Petrificante", "descricao_habilidade": "Ataque corpo a corpo com o bico que causa 1 ponto de dano físico (1d3). Se o alvo for uma criatura viva, ele deve ser bem-sucedido em um Teste de Resistência; em caso de falha, é transformado em pedra, sofrendo o mesmo efeito da Magia Petrificação."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cocatriz-Imperador',
    'Monstro',
    25,
    1,
    '',
    $ATTR${"CON": 13, "FOR": 13, "DEX": 3, "AGI": 7, "INT": 5, "WILL": 5, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Bicada Petrificante Maior", "descricao_habilidade": "Ataque corpo a corpo com o bico que causa dano físico (1d3). Se o alvo for uma criatura viva, ele deve ser bem-sucedido em um Teste de Resistência; em caso de falha, é transformado em pedra, sofrendo o mesmo efeito da Magia Petrificação."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Colosso da Ruptura',
    'Monstro',
    62,
    7,
    '',
    $ATTR${"CON": 45, "FOR": 42, "DEX": 0, "AGI": 7, "INT": 4, "WILL": 4, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pisada", "descricao_habilidade": "Ataque físico por esmagamento que afeta criaturas à sua volta de forma acidental, causando 4d6 pontos de dano."}, {"habilidade": "Jato de Ácido", "descricao_habilidade": "Expele um jato corrosivo capaz de atingir até 25 metros de distância e 5 metros de largura na base, causando 10d6 pontos de dano por ácido. Vítimas podem tentar uma esquiva para reduzir o dano à metade. Pode ser usado uma vez a cada cinco turnos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Composognato',
    'Animal',
    10,
    0,
    '',
    $ATTR${"CON": 9, "FOR": 9, "DEX": 5, "AGI": 9, "INT": 4, "WILL": 5, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Bicada ou Mordida", "descricao_habilidade": "Ataque corpo a corpo que causa 1d3 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Composognato Líder',
    'Animal',
    15,
    1,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 8, "AGI": 10, "INT": 5, "WILL": 5, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida do Líder", "descricao_habilidade": "Ataque corpo a corpo aprimorado que causa 1d3+1 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Corcel do Deserto',
    'Monstro',
    25,
    2,
    '30 M',
    $ATTR${"CON": 23, "FOR": 20, "DEX": 3, "AGI": 13, "INT": 3, "WILL": 3, "PER": 11, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Patadas", "descricao_habilidade": "Seus temíveis cascos com garras permitem realizar dois ataques por turno, causando 1d6 de dano baseado em Força."}, {"habilidade": "Absorção de Umidade", "descricao_habilidade": "A criatura nunca precisa beber água em toda a sua vida adulta, absorvendo a umidade necessária diretamente do ar através de numerosas aberturas em seu corpo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Corcel das Trevas',
    'Morto-Vivo',
    10,
    0,
    '30 M',
    $ATTR${"CON": 30, "FOR": 30, "DEX": 0, "AGI": 12, "INT": 5, "WILL": 5, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Cascos", "descricao_habilidade": "Pode realizar dois ataques por turno com os cascos, causando 1d6+5 de dano baseado em Força."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Serpoente-do-Sol',
    'Monstro',
    82,
    7,
    '45 M',
    $ATTR${"CON": 37, "FOR": 37, "DEX": 5, "AGI": 30, "INT": 12, "WILL": 12, "PER": 13, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida Venenosa", "descricao_habilidade": "Ataque corpo a corpo com as presas que causa 1d10+10 pontos de dano físico e injeta um poderoso veneno que causa 5d6 pontos de dano adicionais."}, {"habilidade": "Ataque com Cauda", "descricao_habilidade": "Pode realizar um ataque secundário chicoteando o alvo com sua cauda, causando 2d6+10 pontos de dano."}, {"habilidade": "Leitura de Mentes", "descricao_habilidade": "Capacidade mística equivalente a Entender Humanos 6, permitindo ler os pensamentos de alvos próximos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Crocodilo do Pântano',
    'Animal',
    42,
    5,
    '',
    $ATTR${"CON": 30, "FOR": 35, "DEX": 5, "AGI": 13, "INT": 5, "WILL": 5, "PER": 17, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Elemento Surpresa", "descricao_habilidade": "Quando imóvel, o crocodilo é extremamente parecido com um velho tronco de árvore. Notar sua presença exige um Teste Difícil de Percepção (ou Habilidade -3). Caso não seja detectado, ele garante um ataque livre antes do início do combate."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque corpo a corpo com suas mandíbulas que causa 2d6 pontos de dano."}, {"habilidade": "Ataque com Cauda", "descricao_habilidade": "Ataque secundário que chicoteia o alvo, causando 2d6+4 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Crocodilo Marinho',
    'Animal',
    42,
    5,
    '',
    $ATTR${"CON": 40, "FOR": 40, "DEX": 5, "AGI": 13, "INT": 5, "WILL": 5, "PER": 17, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Elemento Surpresa", "descricao_habilidade": "Quando imóvel, o crocodilo é extremamente parecido com um velho tronco de árvore. Notar sua presença exige um Teste Difícil de Percepção (ou Habilidade -3). Caso não seja detectado, ele garante um ataque livre antes do início do combate."}, {"habilidade": "Mordida Marinha", "descricao_habilidade": "Ataque corpo a corpo com mandíbulas poderosas que causa 3d6 pontos de dano."}, {"habilidade": "Ataque com Cauda Marinho", "descricao_habilidade": "Ataque secundário com sua cauda pesada, causando 2d6+9 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Fobossuco',
    'Animal',
    42,
    5,
    '',
    $ATTR${"CON": 55, "FOR": 55, "DEX": 3, "AGI": 13, "INT": 5, "WILL": 5, "PER": 17, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Elemento Surpresa", "descricao_habilidade": "Mesmo com proporções gigantescas, quando está imóvel na água confunde-se perfeitamente com o ambiente. Notá-lo exige um Teste Difícil de Percepção (ou Habilidade -3). Caso não seja detectado, ele garante um ataque livre antes do início do combate."}, {"habilidade": "Mordida Devastadora", "descricao_habilidade": "Ataque corpo a corpo esmagador com mandíbulas gigantes, causando 2d6+3 pontos de dano."}, {"habilidade": "Ataque com Cauda Colossal", "descricao_habilidade": "Ataque secundário que varre a área com sua cauda maciça, causando 3d6+15 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Damaru',
    'Animal',
    2,
    0,
    '',
    $ATTR${"CON": 2, "FOR": 2, "DEX": 0, "AGI": 15, "INT": 3, "WILL": 3, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Devorar Construtos", "descricao_habilidade": "O bando é inofensivo contra seres vivos ou mortos-vivos, mas é atraído por personagens Construtos (golens). O cardume ataca uma única vítima de tamanho humano sem necessidade de teste para acertar, causando 1d6 pontos de dano por turno. Nenhuma armadura física ou IP protege contra este dano, exceto defesas geradas por magia (como Proteção Mágica)."}, {"habilidade": "Degradação de Componentes", "descricao_habilidade": "Caso os PVs de um Construto atacado cheguem a zero, cada novo ataque do bando reduz permanentemente 1 ponto de sua Armadura. Se a Armadura zerar, os atributos são degradados na seguinte ordem: Agilidade, Força, e Constituição. O Construto é completamente destruído se todos os atributos zerarem."}, {"habilidade": "Ataques Explosivos", "descricao_habilidade": "Ataques baseados em explosão são capazes de dispersar o bando de damarus com maior facilidade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Demônio do Espelho',
    'Espírito',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Cópia Invertida", "descricao_habilidade": "O demônio do espelho replica perfeitamente todas as características, atributos, pontos de vida, armadura, vantagens, desvantagens e poderes da versão original no momento do encontro. É impossível distinguir a cópia do original, mesmo por meios mágicos."}, {"habilidade": "Ataque do Reflexo", "descricao_habilidade": "Ao saltar do espelho, a criatura ataca imediatamente a sua versão original, buscando deliberadamente causar confusão para que os companheiros do alvo não consigam discernir quem é a criatura real."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Demônio da Lama',
    'Espírito',
    1,
    3,
    '',
    $ATTR${"CON": 20, "FOR": 20, "DEX": 5, "AGI": 7, "INT": 3, "WILL": 3, "PER": 7, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Força", "descricao_habilidade": "Ataque corpo a corpo que causa 3d6 somado ao bônus de Força em dano de esmagamento."}, {"habilidade": "Bola de Lama", "descricao_habilidade": "Ataque à distância que causa 1d6 de dano por contusão e ativa o efeito de paralisia, imobilizando o alvo por alguns instantes."}, {"habilidade": "Sufocamento por Sucção", "descricao_habilidade": "Sempre que o demônio acerta um ataque de Força, a vítima deve ser bem-sucedida em um Teste de Força para não ficar presa na lama de seu corpo. Um novo teste é permitido por turno. Se falhar em dois testes seguidos, a vítima é sugada para o interior do monstro e começa a sufocar."}, {"habilidade": "Amálgama Demôniaca", "descricao_habilidade": "Contra inimigos poderosos, os demônios da lama podem se fundir. Cada demônio adicional além do primeiro concede um bônus cumulativo de +3 em Força, Constituição e Força de Vontade, permitindo que a criatura resultante lance mais bolas de lama por rodada."}, {"habilidade": "Reconstituição", "descricao_habilidade": "Os demônios jamais podem ser destruídos de forma definitiva. Quando derrotados, eles se dissolvem completamente no ambiente e refazem seu corpo após 1d horas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Demônio da Mirage',
    'Espírito',
    7,
    0,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 2, "AGI": 7, "INT": 14, "WILL": 17, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ilusões Inatas", "descricao_habilidade": "O demônio é capaz de conjurar e manter os efeitos equivalentes às magias Ilusão, Ilusão Avançada, Ilusão Total e Invisibilidade como poderes naturais, sem qualquer custo de pontos de vida ou de energia mística."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Demônio das Sombras',
    'Espírito',
    1,
    3,
    '',
    $ATTR${"CON": 20, "FOR": 20, "DEX": 5, "AGI": 7, "INT": 3, "WILL": 3, "PER": 7, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque Sombrio", "descricao_habilidade": "Ataque corpo a corpo que causa 3d6 somado ao bônus de Força em dano físico."}, {"habilidade": "Disparo de Projétil", "descricao_habilidade": "Ataque à distância capaz de causar 1d6 de dano e induzir paralisia no alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Demônio da Ruptura',
    'Monstro',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Aura de Loucura", "descricao_habilidade": "Ver um ou mais Demônios da Ruptura pela primeira vez provoca efeitos mentalmente perturbadores na inteligência de criaturas nativas, podendo induzir à loucura crônica devido à incapacidade da mente de aceitar a existência de tais seres."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Devorador do Deserto',
    'Monstro',
    55,
    10,
    '',
    $ATTR${"CON": 47, "FOR": 47, "DEX": 0, "AGI": 0, "INT": 4, "WILL": 5, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Fosso Escorregadio", "descricao_habilidade": "As paredes da boca cônica do devorador são cobertas por uma secreção escorregadia e espinhos voltados para dentro, impondo um redutor de -3 (-15%) em qualquer teste de Habilidade ou de Perícias para escalar a superfície."}, {"habilidade": "Ataque de Tentáculos", "descricao_habilidade": "Movimentações dentro do fosso alertam a criatura, provocando a saída de 2d6 tentáculos. Cada tentáculo possui Força 1, Habilidade 4, Resistência 1 e Armadura 1. Eles não causam dano, mas tentam agarrar a vítima para puxá-la ao centro. Quando mais de um tentáculo acerta o mesmo alvo, sua Força é cumulativa (ex: 4 acertos significam Força 4). Para não ser arrastada, a vítima deve vencer um Teste de Força com redutor igual à Força conjugada dos tentáculos que a prendem."}, {"habilidade": "Mandíbulas Verdadeiras", "descricao_habilidade": "Caso a vítima ofereça muita resistência, o devorador emerge uma coroa de dentes sobre um pescoço muscular flexível. Um ataque bem-sucedido provoca 3d6 pontos de dano e contribui com Força 3 para arrastar a vítima."}, {"habilidade": "Bolsa do Suco Digestivo", "descricao_habilidade": "Qualquer criatura engolida viva submerge em um suco digestivo fortemente paralisante, exigindo um Teste de Resistência por turno. Se paralisada, a vítima sofre a perda de 1 PV por turno durante a digestão."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Devorador de Ouro',
    'Monstro',
    27,
    5,
    '',
    $ATTR${"CON": 14, "FOR": 14, "DEX": 5, "AGI": 15, "INT": 2, "WILL": 2, "PER": 16, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques de Garras e Mordida", "descricao_habilidade": "O devorador realiza ataques contra um mesmo alvo utilizando suas armas naturais: uma mordida que causa 1d6 de dano e garras que causam 1d6+2 de dano."}, {"habilidade": "Fúria Metálica e Ataque Múltiplo", "descricao_habilidade": "A criatura pode realizar múltiplos ataques extras no mesmo turno contra o mesmo alvo. Ela continua atacando até errar um Teste de Habilidade ou atingir o limite máximo de nove ataques (sendo uma mordida e oito garras) em uma única rodada."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Diabo-da-guerra',
    'Monstro',
    17,
    1,
    '',
    $ATTR${"CON": 13, "FOR": 13, "DEX": 5, "AGI": 20, "INT": 3, "WILL": 3, "PER": 21, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques de Garras e Mordida", "descricao_habilidade": "A criatura coordena seus ataques naturais realizando até três investidas por turno: duas garras que causam 1d6+1 de dano cada e uma mordida que causa 1d3 de dano."}, {"habilidade": "Fúria", "descricao_habilidade": "O diabo-da-guerra pode entrar em um estado de fúria em combate, aumentando sua ferocidade e ímpeto de ataque."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dimmak',
    'Monstro',
    1,
    0,
    '',
    $ATTR${"CON": 45, "FOR": 30, "DEX": 15, "AGI": 15, "INT": 20, "WILL": 20, "PER": 24, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Toque da Morte (Desintegração)", "descricao_habilidade": "Qualquer ataque físico bem-sucedido realizado pelo Dimmak desintegra completamente a vítima, sem direito a testes para resistir. Da mesma forma, tudo o que toca a criatura é destruído: armas comuns ou mágicas utilizadas contra ela desaparecem instantaneamente, e ataques desarmados fazem o atacante sumir em uma névoa luminosa."}, {"habilidade": "Nulidade Mística", "descricao_habilidade": "O Dimmak ignora completamente as leis naturais e mágicas do mundo. Defesas mágicas são ignoradas por seus ataques, e armas, armaduras ou os mais poderosos artefatos mágicos perdem suas propriedades e não funcionam contra ele."}, {"habilidade": "Levitação", "descricao_habilidade": "A criatura flutua estaticamente a poucos centímetros do solo de forma constante."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dinonico',
    'Monstro',
    25,
    1,
    '',
    $ATTR${"CON": 21, "FOR": 21, "DEX": 7, "AGI": 24, "INT": 3, "WILL": 5, "PER": 21, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques de Garras e Mordida", "descricao_habilidade": "A criatura realiza até três ataques normais por rodada, sendo duas garras dianteiras que causam 1d10+3 de dano cada e uma mordida que causa 1d6 de dano."}, {"habilidade": "Salto Obliterador", "descricao_habilidade": "O dinonico pode pular sobre presas de grande porte para prendê-las com os dentes e garras dianteiras. Uma vez preso à presa, ele rasga o alvo utilizando as patas traseiras, realizando dois ataques automáticos por rodada (sem necessidade de testes para acertar), onde cada garra traseira causa dano de Força+2d6. Desalojar o monstro exige que a vítima vença um Teste de Força."}, {"habilidade": "Chute de Reação", "descricao_habilidade": "Contra oponentes de tamanho menor (como humanos), a criatura consegue se apoiar em uma única perna para chutar com a outra. Qualquer alvo posicionado diante do dinonico pode receber este chute sem que a ação conte para o limite de ataques do turno."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dionys',
    'Monstro',
    27,
    4,
    '',
    $ATTR${"CON": 20, "FOR": 24, "DEX": 0, "AGI": 10, "INT": 0, "WILL": 0, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Folhas Mandíbulas (Armadilha)", "descricao_habilidade": "Quando uma criatura pisa sobre a planta, as folhas se fecham rapidamente. A vítima deve ser bem-sucedida em um Teste de Agilidade para evitar ser apanhada e presa."}, {"habilidade": "Esmagamento e Digestão", "descricao_habilidade": "A criatura realiza um ataque automático por rodada contra alvos aprisionados por suas folhas, simulando uma mordida contínua. Este ataque causa 1d6 pontos de dano por esmagamento a cada rodada, ignorando a Armadura do alvo. A dionys não realiza ações de combate convencionais e não pode se defender, focando-se apenas em manter a presa presa até ser totalmente digerida."}, {"habilidade": "Restrição de Combate Interno", "descricao_habilidade": "Uma vítima aprisionada dentro da planta só consegue desferir ataques se for bem-sucedida em um Teste de Força. Mesmo obtendo sucesso, ela só poderá utilizar armas pequenas (como adagas e espadas curtas), limitando o dano máximo dessas armas a 1d6 somado ao bônus de Força da própria vítima."}, {"habilidade": "Dano Compartilhado", "descricao_habilidade": "Caso outros personagens ataquem a dionys pelo lado de fora enquanto ela mantém uma presa em seu interior, metade de todo o dano provocado à planta é transferido e sofrido diretamente pela vítima aprisionada."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão Bicéfalo',
    'Monstro',
    47,
    8,
    '',
    $ATTR${"CON": 40, "FOR": 46, "DEX": 10, "AGI": 17, "INT": 25, "WILL": 20, "PER": 20, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Sopro Duplo Dracônico", "descricao_habilidade": "Por possuir duas cabeças, o bicéfalo pode usar o sopro de dragão duas vezes na mesma rodada (ex: uma rajada de veneno e uma de ácido, referente às cabeças Verde e Preta)."}, {"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão pode realizar múltiplos ataques por turno com suas garras (dano por Força) e mordidas de ambas as cabeças."}, {"habilidade": "Metamorfose Humana", "descricao_habilidade": "Capacidade de assumir a forma de um humano ou semi-humano. Mantém os mesmos atributos, vantagens e focus, mas perde o acesso ao sopro e aos ataques naturais."}, {"habilidade": "Magia Natas", "descricao_habilidade": "Pode conjurar a magia Pânico como uma habilidade natural sem gastar Pontos de Vida ou de Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão Branco',
    'Monstro',
    47,
    8,
    '',
    $ATTR${"CON": 40, "FOR": 46, "DEX": 10, "AGI": 17, "INT": 25, "WILL": 0, "PER": 20, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão pode realizar até três ataques por turno: duas garras (dano por Força) e uma mordida (Força + 2d6)."}, {"habilidade": "Sopro Dracônico (Bafo de Gelo)", "descricao_habilidade": "Dispara uma rajada contínua de material congelante. Usando Tiro Múltiplo, afeta vários alvos diferentes por turno (acerto automático no primeiro, testes de Agilidade sucessivos para os seguintes até errar). Alvos que passem em um teste de esquiva reduzem o dano à metade. Afeta criaturas imunes a danos não-mágicos, mas ignora reflexão, deflexão ou qualquer proteção contra magia mística."}, {"habilidade": "Metamorfose Humana", "descricao_habilidade": "Capacidade de assumir a forma de um humano ou semi-humano. Mantém os mesmos atributos, vantagens e focus (podendo voar sem asas), mas perde o acesso ao sopro e aos ataques naturais."}, {"habilidade": "Magia Natas", "descricao_habilidade": "Pode conjurar a magia Pânico como uma habilidade natural sem gastar Pontos de Vida ou de Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão Negro',
    'Monstro',
    52,
    9,
    '',
    $ATTR${"CON": 45, "FOR": 43, "DEX": 12, "AGI": 19, "INT": 26, "WILL": 0, "PER": 24, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão pode realizar até três ataques por turno: duas garras (dano por Força) e uma mordida (Força + 2d6)."}, {"habilidade": "Sopro Dracônico (Bafo de Veneno)", "descricao_habilidade": "Dispara uma rajada contínua de material tóxico e corrosivo. Usando Tiro Múltiplo, afeta vários alvos diferentes por turno (acerto automático no primeiro, testes de Agilidade sucessivos para os seguintes até errar). Alvos que passem em um teste de esquiva reduzem o dano à metade. Afeta criaturas imunes a danos não-mágicos, mas ignora reflexão, deflexão ou qualquer proteção contra magia mística."}, {"habilidade": "Metamorfose Humana", "descricao_habilidade": "Capacidade de assumir a forma de um humano ou semi-humano. Mantém os mesmos atributos, vantagens e focus (podendo voar sem asas), mas perde o acesso ao sopro e aos ataques naturais."}, {"habilidade": "Magia Natas", "descricao_habilidade": "Pode conjurar a magia Pânico como uma habilidade natural sem gastar Pontos de Vida ou de Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão Verde',
    'Monstro',
    57,
    9,
    '',
    $ATTR${"CON": 50, "FOR": 50, "DEX": 14, "AGI": 25, "INT": 21, "WILL": 0, "PER": 27, "CAR": 12}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão pode realizar até três ataques por turno: duas garras (dano por Força) e uma mordida (Força + 2d6)."}, {"habilidade": "Sopro Dracônico (Bafo de Ácido)", "descricao_habilidade": "Dispara uma rajada de material cáustico destrutivo. Usando Tiro Múltiplo, afeta vários alvos diferentes por turno (acerto automático no primeiro, testes de Agilidade sucessivos para os seguintes até errar). O composto químico continua corroendo as vítimas por duas rodadas adicionais após o impacto inicial, gerando dano persistente por turno. Uma esquiva bem-sucedida reduz o dano inicial à metade. Ignora proteções mágicas, reflexão ou deflexão."}, {"habilidade": "Metamorfose Humana", "descricao_habilidade": "Capacidade de assumir a forma de um humano ou semi-humano. Mantém os mesmos atributos, vantagens e focus (podendo voar sem asas), mas perde o acesso ao sopro e aos ataques naturais."}, {"habilidade": "Magia Natas", "descricao_habilidade": "Pode conjurar a magia Pânico como uma habilidade natural sem gastar Pontos de Vida ou de Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão Vermelho',
    'Monstro',
    72,
    12,
    '',
    $ATTR${"CON": 50, "FOR": 50, "DEX": 16, "AGI": 25, "INT": 31, "WILL": 0, "PER": 27, "CAR": 12}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão pode realizar até três ataques por turno: duas garras (dano por Força) e uma mordida (Força + 2d6)."}, {"habilidade": "Sopro Dracônico (Bafo de Fogo)", "descricao_habilidade": "Dispara uma devastadora rajada contínua de chamas. Usando Tiro Múltiplo, afeta vários alvos diferentes por turno (acerto automático no primeiro, testes de Agilidade sucessivos para os seguintes até errar). Uma esquiva bem-sucedida reduz o dano à metade. Afeta alvos vulneráveis apenas a magia, mas ignora resistências a magia mística, reflexão ou deflexão."}, {"habilidade": "Metamorfose Humana", "descricao_habilidade": "Capacidade de assumir a forma de um humano ou semi-humano. Mantém os mesmos atributos, vantagens e focus (podendo voar sem asas), mas perde o acesso ao sopro e aos ataques naturais."}, {"habilidade": "Magia Natas", "descricao_habilidade": "Pode conjurar a magia Pânico como uma habilidade natural sem gastar Pontos de Vida ou de Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão Azul',
    'Monstro',
    57,
    7,
    '',
    $ATTR${"CON": 45, "FOR": 45, "DEX": 14, "AGI": 25, "INT": 21, "WILL": 0, "PER": 27, "CAR": 12}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão pode realizar até três ataques por turno: duas garras (dano por Força) e uma mordida (Força + 2d6)."}, {"habilidade": "Sopro Dracônico (Relâmpago)", "descricao_habilidade": "Dispara uma rajada contínua de pura eletricidade destrutiva pela boca. Usando Tiro Múltiplo, afeta vários alvos diferentes por turno (acerto automático no primeiro, testes de Agilidade sucessivos para os seguintes até errar). Alvos que passem em uma esquiva reduzem o dano à metade. Ignora quaisquer defesas mágicas, reflexão ou deflexão."}, {"habilidade": "Metamorfose Humana", "descricao_habilidade": "Capacidade de assumir a forma de um humano ou semi-humano. Mantém os mesmos atributos, vantagens e focus (podendo voar sem asas), mas perde o acesso ao sopro e aos ataques naturais."}, {"habilidade": "Magia Natas", "descricao_habilidade": "Pode conjurar a magia Pânico como uma habilidade natural sem gastar Pontos de Vida ou de Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão Marinho',
    'Monstro',
    72,
    10,
    '',
    $ATTR${"CON": 60, "FOR": 55, "DEX": 10, "AGI": 19, "INT": 20, "WILL": 0, "PER": 19, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão pode realizar até três ataques por turno: duas garras (dano por Força) e uma mordida (Força + 2d6)."}, {"habilidade": "Sopro Dracônico (Rajada d'Água)", "descricao_habilidade": "Expele um poderoso jato pressurizado elemental. Usando Tiro Múltiplo, afeta vários alvos diferentes por turno (acerto automático no primeiro, testes de Agilidade sucessivos para os seguintes até errar). Uma esquiva reduz o dano à metade. Ignora proteções contra magia mística, reflexão ou deflexão."}, {"habilidade": "Metamorfose Humana", "descricao_habilidade": "Capacidade de assumir a forma de um humano ou semi-humano. Mantém os mesmos atributos, vantagens e focus (podendo nadar/voar), mas perde o acesso ao sopro e aos ataques naturais."}, {"habilidade": "Magia Natas", "descricao_habilidade": "Pode conjurar a magia Pânico como uma habilidade natural sem gastar Pontos de Vida ou de Magia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão da Terra',
    'Monstro',
    57,
    8,
    '',
    $ATTR${"CON": 42, "FOR": 42, "DEX": 16, "AGI": 25, "INT": 27, "WILL": 30, "PER": 22, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar e flutuar livremente pelo ar, mesmo sem possuir asas."}, {"habilidade": "Forma Humana", "descricao_habilidade": "Capacidade natural de se transformar em uma forma humana ou semi-humana para interagir com humanoides ou viajar incógnito, retendo seus atributos e vantagens (exceto ataques draconianos e sopro)."}, {"habilidade": "Ataques Draconianos", "descricao_habilidade": "Quando não utiliza sua arma de sopro, pode realizar até três ataques por turno: duas garras (causam dano baseado em Força - 1d6) e uma mordida (causa dano baseado em Força + 1d6)."}, {"habilidade": "Ataque Base de Cauda", "descricao_habilidade": "Ataque físico realizado com a cauda longa e musculosa (90/60, causando 3d6+12 de dano)."}, {"habilidade": "Sopro Dracônico", "descricao_habilidade": "Pode descarregar uma rajada mística cáustica e elemental de ácido por sua bocarra. O acerto é automático no primeiro alvo; para cada alvo seguinte atingido na varredura contínua, exige-se um teste de Agilidade bem-sucedido até falhar. Uma esquiva reduz o dano à metade. Afeta criaturas vulneráveis apenas a magia, ignora proteções ou resistências mágicas e não pode ser refletido ou defletido."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão do Ar',
    'Monstro',
    60,
    9,
    '',
    $ATTR${"CON": 42, "FOR": 42, "DEX": 16, "AGI": 25, "INT": 27, "WILL": 30, "PER": 22, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar e flutuar livremente pelo ar, mesmo sem possuir asas."}, {"habilidade": "Forma Humana", "descricao_habilidade": "Capacidade natural de se transformar em uma forma humana ou semi-humana para interagir com humanoides ou viajar incógnito, retendo seus atributos e vantagens (exceto ataques draconianos e sopro)."}, {"habilidade": "Ataques Draconianos", "descricao_habilidade": "Quando não utiliza sua arma de sopro, pode realizar até três ataques por turno: duas garras (causam dano baseado em Força - 1d6) e uma mordida (causa dano baseado em Força + 1d6)."}, {"habilidade": "Ataque Base de Cauda", "descricao_habilidade": "Ataque físico realizado com a cauda longa e musculosa (90/60, causando 3d6+11 de dano)."}, {"habilidade": "Sopro Dracônico", "descricao_habilidade": "Pode descarregar uma rajada mística e elemental de relâmpagos por sua bocarra. O acerto é automático no primeiro alvo; para cada alvo seguinte atingido na varredura contínua, exige-se um teste de Agilidade bem-sucedido até falhar. Uma esquiva reduz o dano à metade. Afeta criaturas vulneráveis apenas a magia, ignora proteções ou resistências mágicas e não pode ser refletido ou defletido."}, {"habilidade": "Conjurar Relampagos", "descricao_habilidade": "Pode invocar rajadas de relâmpagos diretamente sobre oponentes até 5 vezes ao dia, descarregando 10d6+6 pontos de dano por eletricidade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão do Vácuo',
    'Monstro',
    85,
    14,
    '',
    $ATTR${"CON": 57, "FOR": 57, "DEX": 21, "AGI": 17, "INT": 25, "WILL": 25, "PER": 22, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar e flutuar livremente pelo ar, mesmo sem possuir asas."}, {"habilidade": "Forma Humana", "descricao_habilidade": "Capacidade natural de se transformar em uma forma humana ou semi-humana para interagir com humanoides ou viajar incógnito, retendo seus atributos e vantagens (exceto ataques draconianos e sopro)."}, {"habilidade": "Ataques Draconianos", "descricao_habilidade": "Quando não utiliza sua arma de sopro, pode realizar até três ataques por turno: duas garras (causam dano baseado em Força - 1d6) e uma mordida (causa dano baseado em Força + 1d6)."}, {"habilidade": "Ataque Base de Cauda", "descricao_habilidade": "Ataque físico realizado com a cauda longa e musculosa (90/60, causando 4d6+12 de dano)."}, {"habilidade": "Sopro Dracônico", "descricao_habilidade": "Pode descarregar uma rajada mística elemental pura de Luz ou Trevas por sua bocarra. O acerto é automático no primeiro alvo; para cada alvo seguinte atingido na varredura contínua, exige-se um teste de Agilidade bem-sucedido até falhar. Uma esquiva reduz o dano à metade. Afeta criaturas vulneráveis apenas a magia, ignora proteções ou resistências mágicas e não pode ser refletido ou defletido."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão da Água',
    'Monstro',
    70,
    10,
    '',
    $ATTR${"CON": 52, "FOR": 52, "DEX": 16, "AGI": 21, "INT": 27, "WILL": 27, "PER": 22, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar e flutuar livremente pelo ar, mesmo sem possuir asas."}, {"habilidade": "Forma Humana", "descricao_habilidade": "Capacidade natural de se transformar em uma forma humana ou semi-humana para interagir com humanoides ou viajar incógnito, retendo seus atributos e vantagens (exceto ataques draconianos e sopro)."}, {"habilidade": "Ataques Draconianos", "descricao_habilidade": "Quando não utiliza sua arma de sopro, pode realizar até três ataques por turno: duas garras (causam dano baseado em Força - 1d6) e uma mordida (causa dano baseado em Força + 1d6)."}, {"habilidade": "Ataque Base de Cauda", "descricao_habilidade": "Ataque físico realizado com a cauda longa e musculosa (90/60, causando 3d6+11 de dano)."}, {"habilidade": "Sopro Dracônico", "descricao_habilidade": "Pode descarregar uma rajada mística e torrencial de água por sua bocarra. O acerto é automático no primeiro alvo; para cada alvo seguinte atingido na varredura contínua, exige-se um teste de Agilidade bem-sucedido até falhar. Uma esquiva reduz o dano à metade. Afeta criaturas vulneráveis apenas a magia, ignora proteções ou resistências mágicas e não pode ser refletido ou defletido."}, {"habilidade": "Comando Marinho", "descricao_habilidade": "Capacidade natural de controlar mentalmente e comandar de forma absoluta qualquer tipo de peixe, crustáceo ou criatura marinha localizada em um raio de até 100 metros."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão do Fogo',
    'Monstro',
    70,
    10,
    '',
    $ATTR${"CON": 57, "FOR": 57, "DEX": 21, "AGI": 17, "INT": 25, "WILL": 25, "PER": 22, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar e flutuar livremente pelo ar, mesmo sem possuir asas."}, {"habilidade": "Forma Humana", "descricao_habilidade": "Capacidade natural de se transformar em uma forma humana ou semi-humana para interagir com humanoides ou viajar incógnito, retendo seus atributos e vantagens (exceto ataques draconianos e sopro)."}, {"habilidade": "Ataques Draconianos", "descricao_habilidade": "Quando não utiliza sua arma de sopro, pode realizar até três ataques por turno: duas garras (causam dano baseado em Força - 1d6) e uma mordida (causa dano baseado em Força + 1d6)."}, {"habilidade": "Ataque Base de Cauda", "descricao_habilidade": "Ataque físico realizado com a cauda longa e musculosa (90/60, causando 3d6+11 de dano)."}, {"habilidade": "Sopro Dracônico", "descricao_habilidade": "Pode descarregar uma rajada mística e devastadora de chamas por sua bocarra. O acerto é automático no primeiro alvo; para cada alvo seguinte atingido na varredura contínua, exige-se um teste de Agilidade bem-sucedido até falhar. Uma esquiva reduz o dano à metade. Afeta criaturas vulneráveis apenas a magia, ignora proteções ou resistências mágicas e não pode ser refletido ou defletido."}, {"habilidade": "Cone Flamejante", "descricao_habilidade": "Até 10 vezes ao dia, pode expelir um poderoso Bafo de Fogo em formato de cone com 20m de comprimento (5m de largura na base e 10m no final), infligindo 10d10+6 pontos de dano por fogo em todas as criaturas na área."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão-do-Deserto',
    'Monstro',
    200,
    25,
    '',
    $ATTR${"CON": 90, "FOR": 80, "DEX": 12, "AGI": 12, "INT": 20, "WILL": 20, "PER": 24, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida em Área", "descricao_habilidade": "Ataque realizado com a mandíbula colossal por toda uma área, cobrindo o alcance de seu pescoço flexível. Causa 10d6+20 pontos de dano por Força."}, {"habilidade": "Garras", "descricao_habilidade": "Ataques de garras padrão de dragão. Duas garras que causam dano baseado em Força (80)."}, {"habilidade": "Abocanhar e Engolir", "descricao_habilidade": "Caso a vítima sofra mais de 20 pontos de dano em um único ataque de mordida (após a redução do IP), ela é imediatamente engolida viva. O sistema digestivo interno causa 2d6 pontos de dano automático por turno (sem direito a absorção por IP/Armadura) até a morte do alvo. A vítima só pode ser resgatada por Teleporte ou meios similares."}, {"habilidade": "Bafo de Ar Quente", "descricao_habilidade": "Projeta um jato de areia escaldante em forma de leque tão amplo que atinge todos os alvos diante de sua boca, exceto oponentes posicionados diretamente atrás de sua cabeça. Não exige teste para acertar, esquivas bem-sucedidas reduzem o dano à metade, afeta alvos vulneráveis apenas a magia, ignora Deflexão, Reflexão e proteções mágicas. Causa 10d10+20 pontos de dano e reduz permanentemente o IP do alvo em 1 ponto para cada 10 pontos de dano sofridos. Limitação: Pode ser usado até 3 vezes ao dia."}, {"habilidade": "Retirada Subterrânea", "descricao_habilidade": "Os 200 PVs representam apenas a porção exposta de seu corpo. Ao ser reduzido a 0 PVs, o dragão se enterra completamente na areia para se refugiar e se curar, retornando ao cenário após 1d6+2 dias."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragoas-Caçadoras',
    'Monstro',
    25,
    2,
    '',
    $ATTR${"CON": 20, "FOR": 20, "DEX": 12, "AGI": 15, "INT": 12, "WILL": 12, "PER": 10, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Arma", "descricao_habilidade": "Realiza um ataque por turno utilizando seu armamento, causando dano baseado na arma equipada."}, {"habilidade": "Movimentação Arbórea", "descricao_habilidade": "Capacidade biológica e adaptativa que permite às caçadoras passar a vida inteira habitando e movendo-se com extrema rapidez, agilidade e graça pelas árvores, raramente descendo ao solo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragonetes',
    'Fada',
    15,
    0,
    '',
    $ATTR${"CON": 10, "FOR": 7, "DEX": 10, "AGI": 10, "INT": 10, "WILL": 10, "PER": 10, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Arma", "descricao_habilidade": "Realiza um ataque por turno utilizando suas garras ou mordida, causando dano baseado em sua Força."}, {"habilidade": "Sopro Elemental", "descricao_habilidade": "Dispara uma lufada mágica baseada em Fogo, Água, Luz ou Ar. Causa 1d6 pontos de dano elemental ao alvo."}, {"habilidade": "Capacidade de Conjuração", "descricao_habilidade": "Aptidão mística inata que permite a alguns indivíduos da espécie conjurar feitiços e magias utilitárias baseadas em Fogo, Água, Ar e Luz, além de ilusões e invisibilidade para pregar peças. Nunca são capazes de conjurar magias puras de ataque."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dríade',
    'Fada',
    17,
    2,
    '',
    $ATTR${"CON": 19, "FOR": 17, "DEX": 11, "AGI": 11, "INT": 11, "WILL": 11, "PER": 11, "CAR": 11}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Laço da Árvore-Irmã", "descricao_habilidade": "Sua vida está vinculada a uma árvore antiga específica. A dríade é imortal enquanto sua Árvore-irmã estiver intacta. Ao ser reduzida a 0 PVs, seu corpo se dissolve completamente e ela renasce aos pés de sua árvore protetora após uma semana."}, {"habilidade": "Constrição Vegetal (Paralisia)", "descricao_habilidade": "Habilidade de controlar as plantas ao seu redor, manifestando cipós e raízes do solo para imobilizar ou paralisar oponentes e alvos indesejados."}, {"habilidade": "Canto da Sereia Inato", "descricao_habilidade": "Capacidade mística natural de utilizar o feitiço Canto da Sereia de forma ilimitada, sem qualquer custo de Pontos de Vida ou de Magia, para encantar e atrair viajantes."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Doppleganger',
    'Humanoide',
    20,
    1,
    '',
    $ATTR${"CON": 19, "FOR": 19, "DEX": 11, "AGI": 14, "INT": 11, "WILL": 11, "PER": 11, "CAR": 11}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Briga", "descricao_habilidade": "Realiza um ataque desarmado por rodada com bônus de combate (+60/+60), desferindo um soco ou golpe corporal que causa 1d6 + bônus de Força em pontos de dano."}, {"habilidade": "Mimetismo Humanóide Parcial", "descricao_habilidade": "Caso consiga apenas ver e ouvir o alvo, o doppleganger cria uma cópia física com 95% de perfeição. A transformação é física e real (não-ilusória), enganando até Sentidos Especiais. Contudo, nesta cópia parcial, ele não herda as memórias, habilidades, características básicas ou poderes especiais do alvo (ex: se o alvo tiver asas, o duplo terá as asas visualmente mas não poderá usá-las)."}, {"habilidade": "Mimetismo Humanóide Total", "descricao_habilidade": "Ao focar e interagir profundamente com o alvo, o doppleganger realiza uma cópia total, absorvendo e trocando de mentes, memórias e copiando perfeitamente as características e habilidades do indivíduo. Restrições: Só pode assumir formas humanóides com tamanho entre um halfling e um ogre. É impossível copiar totalmente mortos-vivos, construtos, dragões/meio-dragões, elementais, invertebrados (como Demônios da Ruptura) e o povo-fada (sprites, dríades, nereidas e ninfas), embora ainda possa fazer cópias parciais deles."}, {"habilidade": "Reconhecimento Inato", "descricao_habilidade": "Uma percepção biológica e mística absoluta que garante que um doppleganger sempre consiga reconhecer instantaneamente outro doppleganger, independentemente da forma ou disfarce que ambos estejam utilizando."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Elefante da Savana',
    'Animal',
    62,
    4,
    '',
    $ATTR${"CON": 42, "FOR": 42, "DEX": 10, "AGI": 5, "INT": 3, "WILL": 5, "PER": 12, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Presas", "descricao_habilidade": "Escolha de ataque terrestre por turno utilizando suas longas presas de marfim, infligindo 1d6+3 pontos de dano físico baseados em sua Força."}, {"habilidade": "Pisotear com Patas Dianteiras", "descricao_habilidade": "Alternativa de ataque terrestre onde desfere dois golpes rápidos por turno usando as patas frontais, causando dano bruto baseado puramente em sua Força (42) a cada impacto."}, {"habilidade": "Sopro de Tromba d'Água", "descricao_habilidade": "Quando submerso ou em contato direto com corpos d'água, o elefante pode aspirar o líquido e disparar jatos pressurizados através de sua tromba, atuando como um ataque de elemental de água."}, {"habilidade": "Destreza da Tromba", "descricao_habilidade": "Sua tromba possui uma musculatura extremamente forte e habilidosa, permitindo-lhe manipular objetos e realizar quase as mesmas façanhas funcionais de uma mão humana."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Mastodonte',
    'Animal',
    62,
    4,
    '',
    $ATTR${"CON": 45, "FOR": 45, "DEX": 12, "AGI": 5, "INT": 3, "WILL": 5, "PER": 12, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Presas", "descricao_habilidade": "Escolha de ataque terrestre por turno utilizando suas presas ancestrais, infligindo 1d6+7 pontos de dano físico impulsionados por sua Força avantajada."}, {"habilidade": "Pisotear com Patas Dianteiras", "descricao_habilidade": "Alternativa de ataque terrestre onde desfere dois impactos pesados por turno usando as patas frontais, causando dano bruto baseado puramente em sua Força (45) a cada golpe."}, {"habilidade": "Sopro de Tromba d'Água", "descricao_habilidade": "Quando em ambiente aquático, pode usar sua tromba para disparar rajadas pressurizadas de água, atuando como um ataque elemental."}, {"habilidade": "Destreza da Tromba", "descricao_habilidade": "Sua tromba preênsil de alta precisão é extremamente forte, permitindo-lhe interagir com o ambiente e manipular objetos com facilidade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Mamute',
    'Animal',
    62,
    5,
    '',
    $ATTR${"CON": 47, "FOR": 47, "DEX": 12, "AGI": 5, "INT": 3, "WILL": 5, "PER": 12, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Presas Devastadoras", "descricao_habilidade": "Escolha de ataque terrestre por turno utilizando suas gigantescas presas curvadas, infligindo 2d6+7 pontos de dano esmagador."}, {"habilidade": "Pisotear com Patas Dianteiras", "descricao_habilidade": "Alternativa de ataque terrestre onde ergue seu peso colossal para desferir dois pisoteios por turno com as patas frontais, causando dano bruto baseado em sua Força (47) a cada impacto."}, {"habilidade": "Sopro de Tromba d'Água", "descricao_habilidade": "Caso esteja junto a fontes de água, pode absorver o líquido e projetar jatos de alta pressão com a tromba, operando como um ataque a distânica."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Elemental*',
    'Construto',
    10,
    0,
    '10 M',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 10, "AGI": 10, "INT": 10, "WILL": 10, "PER": 10, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Corpo Elemental", "descricao_habilidade": "Possui permanentemente as habilidades da magia Corpo Elemental do seu respectivo elemento, sem limite de tempo ou gasto de PMs."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Elfo',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Tradição em Armas Élficas", "descricao_habilidade": "Devido ao treinamento ancestral e orgulho cultural de sua linhagem, recebe um bônus mecânico de +2 no dano total sempre que utilizar arcos ou espadas longas em combate."}, {"habilidade": "Visão na Penumbra", "descricao_habilidade": "Capacidade biológica de enxergar com perfeição no escuro, desde que haja uma iluminação mínima ou fresta de luz no ambiente; não funciona na escuridão total mística ou absoluta."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Meio-Elfo',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Visão na Penumbra Herdada", "descricao_habilidade": "Capacidade de enxergar perfeitamente em ambientes de baixa luminosidade, desde que haja uma fonte mínima de luz disponível."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Elfo-do-Céu',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo Ininterrupto", "descricao_habilidade": "Como herança biológica do seu ancestral dragão azul, a criatura é capaz de voar continuamente por quanto tempo desejar, sem sofrer de exaustão ou precisar de parar para descansar. Possui a incrível aptidão de dormir enquanto se mantém em voo."}, {"habilidade": "Visão na Penumbra Herdada", "descricao_habilidade": "Capacidade racial de enxergar com total perfeição em ambientes escuros, necessitando de uma iluminação mínima disponível; falha se for colocada em escuridão mística ou total."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Elfo-do-Mar',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Sonar Subaquático", "descricao_habilidade": "Habilidade sensorial ativa que funciona exclusivamente debaixo de água, emitindo ondas sonoras capazes de mapear e detetar alvos e arredores num alcance de até 120 metros."}, {"habilidade": "Metamorfose Marinha", "descricao_habilidade": "Poder místico inato que permite ao elfo transformar-se fisicamente numa criatura marinha comum (como um golfinho ou lontra-marinha) até 3 vezes por dia. Na forma animal, ganha as suas habilidades biológicas, mas fica impedido de conjurar magias. Funciona apenas sob a água; se sair para a superfície na forma animal, não conseguirá reverter para o seu estado normal."}, {"habilidade": "Dependência de Água", "descricao_habilidade": "Viver em terra firme expõe o seu organismo a uma imensa dor e debilitação constante. Para anular os danos e a degeneração do corpo murcho, a criatura precisa de mergulhar em água (doce ou salgada) pelo menos uma vez a cada dois dias. Um mergulho de 15 minutos em água salgada restaura completamente a sua saúde."}, {"habilidade": "Reconhecimento de Espécie", "descricao_habilidade": "Percepção absoluta que garante que um elfo-do-mar seja sempre capaz de reconhecer instantaneamente outro membro da sua raça, independentemente da forma animal que este esteja a adotar no momento."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Enfermeiras',
    'Animal',
    3,
    0,
    '',
    $ATTR${"CON": 5, "FOR": 3, "DEX": 1, "AGI": 5, "INT": 1, "WILL": 1, "PER": 10, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Secreção Cicatrizante", "descricao_habilidade": "Capacidade biológica de secretar sobre ferimentos uma enzima com propriedades altamente desinfetantes e cicatrizantes, restaurando automaticamente 1 PV por rodada na criatura afetada."}, {"habilidade": "Estabilização Médica", "descricao_habilidade": "Quando atuam em bando sobre um personagem levado a 0 Pontos de Vida (perto da morte), garantem um sucesso automático em testes de Medicina para salvá-lo."}, {"habilidade": "Enzima Antivivo (Ataque a Mortos-Vivos)", "descricao_habilidade": "Habilidade ofensiva ativada exclusivamente contra mortos-vivos (únicas criaturas que despertam o seu ódio). Expelem jatos de enzima concentrada que causam dano  2d6."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Entes',
    'Planta',
    37,
    4,
    '',
    $ATTR${"CON": 30, "FOR": 30, "DEX": 15, "AGI": 10, "INT": 21, "WILL": 21, "PER": 20, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Esmagamento por Cipós", "descricao_habilidade": "Em combate, a criatura é capaz de esticar e alongar os seus braços lignificados como se fossem cipós flexíveis para golpear alvos distantes. Realiza até dois ataques físicos de esmagamento por turno, infligindo dano baseado em sua Força (30)."}, {"habilidade": "Metamorfose Humanoide", "descricao_habilidade": "Poder místico de assumir a aparência de uma pessoa ou elfo maduro e sábio, frequentemente confundido com um druida. Restrição: Esta forma alternativa não pode ser utilizada durante o dia, período no qual a criatura é biologicamente obrigada a reverter ao seu estado de árvore para realizar fotossíntese."}, {"habilidade": "Comunicação Arbórea", "descricao_habilidade": "Mesmo quando fixa em sua forma vegetal estática, a criatura é capaz de se projetar mentalmente por meio de telepatia para dialogar com qualquer ser presente em sua floresta, além de coordenar pensamentos diretamente com outros entes sem emitir palavras ou gestos."}, {"habilidade": "Reconhecimento Absoluto", "descricao_habilidade": "Aptidão perceptiva que garante que um ente consiga sempre identificar e reconhecer perfeitamente outro membro da sua espécie, independentemente da forma física que ambos estejam utilizando no momento."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Escudeiro',
    'Animal',
    10,
    6,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 0, "AGI": 4, "INT": 2, "WILL": 2, "PER": 4, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Chicoteada de Cauda", "descricao_habilidade": "Ataque físico padrão onde a criatura chicoteia os seus inimigos utilizando a cauda segmentada, causando dano baseado em sua Força (10)."}, {"habilidade": "Simbiose de Combate (Modo Escudo)", "descricao_habilidade": "Quando devidamente treinado, o animal pode obedecer a um comando para se agarrar firmemente ao braço do seu portador. Nesta postura, funciona como um escudo vivo excelente, oferecendo Índice de Proteção 6, bônus defensivo de Armadura 4 e a capacidade de realizar Deflexão para o usuário sob as diretrizes de Parceiro."}, {"habilidade": "Cauda Destacável", "descricao_habilidade": "Enquanto está acoplada no braço do dono em modo escudo, a sua cauda se enrijece e pode ser destacada para servir como uma arma de combate. Causa dano igual à Força do usuário + 1d ou 2d6 + bônus de Força de Vontade. A cauda pode ser recolocada no lugar após o confronto."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Esfinge',
    'Monstro',
    37,
    4,
    '',
    $ATTR${"CON": 18, "FOR": 19, "DEX": 15, "AGI": 15, "INT": 18, "WILL": 18, "PER": 18, "CAR": 14}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Garras", "descricao_habilidade": "Desfere até dois ataques físicos por rodada utilizando as suas garras leoninas afiadas, infligindo 1d10+3 pontos de dano físico a cada impacto bem-sucedido."}, {"habilidade": "Aptidão Mística e Idiomas", "descricao_habilidade": "Profundo intelecto que confere à esfinge o conhecimento de uma vasta gama de idiomas, propriedades de itens mágicos e encantamentos. Quase todas possuem aptidões místicas naturais, dominando feitiços utilitários e variados."}, {"habilidade": "Asas Ocultas", "descricao_habilidade": "Habilidade biológica e mágica exclusiva das fêmeas da espécie, permitindo que façam as suas asas sumirem ou ressurgirem instantaneamente conforme a sua própria vontade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Esqueletos',
    'Morto-Vivo',
    10,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 14, "DEX": 5, "AGI": 5, "INT": 1, "WILL": 1, "PER": 12, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Garras", "descricao_habilidade": "Caso esteja desarmado, realiza um ataque físico por turno arranhando o alvo com suas falanges afiadas, infligindo 1d6 pontos de dano."}, {"habilidade": "Ataque por Arma", "descricao_habilidade": "Caso esteja equipado, realiza um ataque por rodada utilizando o armamento fornecido pelo seu invocador (como espadas ou lanças velhas), desferindo dano baseado na arma."}, {"habilidade": "Estrutura Óssea", "descricao_habilidade": "Por não possuir carne, órgãos ou tecidos vulneráveis em sua constituição anatômica, a criatura é naturalmente resistente a perfurações, recebendo sempre metade do dano total proveniente de ataques e armas perfurantes."}, {"habilidade": "Dano Irreversível", "descricao_habilidade": "As energias negativas que o sustentam são instáveis: os esqueletos nunca podem recuperar Pontos de Vida perdidos sob nenhuma circunstância, seja por meio de descanso místico ou magias de cura. Uma vez danificados ou destruídos, seus ossos jamais podem ser restaurados."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Camaleão',
    'Animal',
    10,
    0,
    '',
    $ATTR${"CON": 2, "FOR": 2, "DEX": 0, "AGI": 10, "INT": 1, "WILL": 1, "PER": 12, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Familiar", "descricao_habilidade": "Quando convive com um usuário de magia, une-se totalmente a ele como um Parceiro, combinando as características mais altas e vantagens. Concede permanentemente +10 PVs ao dono místico."}, {"habilidade": "Camuflagem Eficiente", "descricao_habilidade": "A criatura possui 90% de chance de camuflagem mimetizada, agindo como se estivesse sob o efeito de invisibilidade em seu ambiente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Corvo',
    'Animal',
    10,
    0,
    '15 M',
    $ATTR${"CON": 5, "FOR": 3, "DEX": 3, "AGI": 5, "INT": 2, "WILL": 2, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Familiar", "descricao_habilidade": "Quando convive com um usuário de magia, une-se totalmente a ele como um Parceiro, combinando as características mais altas e vantagens. Concede permanentemente +10 PVs ao dono místico."}, {"habilidade": "Ataque com Bicada", "descricao_habilidade": "Ataque físico corporal desferido com o bico, causando 1d3 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gato',
    'Animal',
    10,
    0,
    '',
    $ATTR${"CON": 5, "FOR": 3, "DEX": 3, "AGI": 15, "INT": 2, "WILL": 2, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Familiar", "descricao_habilidade": "Quando convive com um usuário de magia, une-se totalmente a ele como um Parceiro, combinando as características mais altas e vantagens. Concede permanentemente +10 PVs ao dono místico."}, {"habilidade": "Ataque com Garras", "descricao_habilidade": "Ataque físico desarmado utilizando as garras, causando 1d3 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cão / Lobo',
    'Animal',
    10,
    0,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 1, "AGI": 10, "INT": 2, "WILL": 2, "PER": 20, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Familiar", "descricao_habilidade": "Quando convive com um usuário de magia, une-se totalmente a ele como um Parceiro, combinando as características mais altas e vantagens. Concede permanentemente +10 PVs ao dono místico."}, {"habilidade": "Ataque com Mordida", "descricao_habilidade": "Ataque físico utilizando as mandíbulas, gerando dano variável baseado no porte do animal entre 1d3 e 1d6."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Macaco',
    'Animal',
    10,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 5, "DEX": 7, "AGI": 17, "INT": 3, "WILL": 3, "PER": 15, "CAR": 4}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Familiar", "descricao_habilidade": "Quando convive com um usuário de magia, une-se totalmente a ele como um Parceiro, combinando as características mais altas e vantagens. Concede permanentemente +10 PVs ao dono místico."}, {"habilidade": "Ataque de Briga", "descricao_habilidade": "Ataque físico ágil desarmado que causa 1d3 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Sapo',
    'Animal',
    10,
    0,
    '',
    $ATTR${"CON": 2, "FOR": 2, "DEX": 1, "AGI": 7, "INT": 1, "WILL": 1, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Familiar", "descricao_habilidade": "Quando convive com um usuário de magia, une-se totalmente a ele como um Parceiro, combinando as características mais altas e vantagens. Concede permanentemente +10 PVs ao dono místico."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Fantasma',
    'Morto-Vivo',
    20,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 15, "WILL": 15, "PER": 22, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Natureza Imaterial", "descricao_habilidade": "Não possui corpo físico. Capaz de voar, levitar e interagir fisicamente com o mundo (como levantar peso ou atacar) projetando sua força de vontade, operando mecanicamente com as capacidades de seu perfil."}, {"habilidade": "Possessão", "descricao_habilidade": "Pode possuir uma criatura humana ou humanoide, assumindo o controle total de seu corpo durante 3d6 rodadas. Nesse período, os atributos do fantasma passam a ser os da vítima possuída."}, {"habilidade": "Aura de Medo Natural", "descricao_habilidade": "Manifesta uma aura mística de pânico em um raio de 50 metros. Qualquer criatura na área deve passar em um teste fácil de Força de Vontade (WILL) ou será forçada a fugir da região imediatamente. Não consome recursos misticos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Fênix',
    'Monstro',
    40,
    5,
    '250 M',
    $ATTR${"CON": 35, "FOR": 33, "DEX": 3, "AGI": 15, "INT": 24, "WILL": 24, "PER": 36, "CAR": 20}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Nobreza Guerreira", "descricao_habilidade": "A fênix não obedece a ordens diretas, mas luta voluntariamente pelo que considera justo. Ela sempre recebe a iniciativa em combate de forma automática."}, {"habilidade": "Ataques Naturais", "descricao_habilidade": "Pode desferir um ataque por rodada escolhendo entre uma Bicada (causando 1d6+3 de dano) ou suas Garras (causando 2d6 de dano)."}, {"habilidade": "Sacrifício Heroico", "descricao_habilidade": "Em situações extremas, a criatura explode voluntariamente em uma chuva de fogo que inflige 10d6 de dano em todos os inimigos (poupando aliados) em um raio de até 100m. Desta detonação nascem de 2 a 5 jovens fênix."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Fera-Cactus',
    'Planta',
    22,
    3,
    '',
    $ATTR${"CON": 20, "FOR": 18, "DEX": 5, "AGI": 9, "INT": 3, "WILL": 3, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Disparo de Espinhos", "descricao_habilidade": "Pode arremessar de 1 a 6 espinhos longos por turno como um ataque à distância, causando 1d6 de dano por espinho."}, {"habilidade": "Garras Sugadoras de Sangue", "descricao_habilidade": "Ataque físico corporal com garras que causa 1d6+1 de dano. Se o dano final infligido for maior que 1 ponto, os espinhos ocos se cravam na carne e sugam o sangue da vítima, que passa a perder 1d6 PVs por turno automaticamente. Para se libertar, a vítima ou um aliado deve gastar uma ação e obter sucesso em um teste de ataque contra as garras (este ato não fere a fera)."}, {"habilidade": "Passos Almofadados", "descricao_habilidade": "Seus pés são macios e não emitem ruídos ao caminhar, tornando seus movimentos impossíveis de serem detectados audivelmente, exceto por oponentes portando Sentidos Especiais de audição."}, {"habilidade": "Sensibilidade Hidrolítica", "descricao_habilidade": "Água em excesso causa apodrecimento fulminante, matando a criatura em 4 rodadas. Sofre redutor de -1 em testes de resistência contra magias de Água, e sua Armadura é considerada mínima (0) contra ataques desse elemento."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Lagosta da Ruptura',
    'Demônio',
    52,
    5,
    '',
    $ATTR${"CON": 35, "FOR": 32, "DEX": 4, "AGI": 11, "INT": 4, "WILL": 4, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Multiplos Ataques", "descricao_habilidade": "A criatura realiza quatro ataques por turno usando seus quatro braços. Dois ataques são feitos com suas garras pequenas inferiores (1d6 de dano) e dois com suas garras grandes superiores (4d6 de dano com propriedade Vorpal)."}, {"habilidade": "Garras Vorpais", "descricao_habilidade": "Sempre que obtiver um resultado 1 em seu Teste de Habilidade para o ataque com as garras grandes, ou rolar um acerto crítico, o alvo deve fazer imediatamente um Teste de Resistência. Se falhar, tem a cabeça ou um membro decepado."}, {"habilidade": "Proteção Elemental de Carapaça", "descricao_habilidade": "Possui proteção equivalente a 6d6 contra Ácido, Eletricidade ou Veneno mundanos, e 4d6 contra as versões mágicas desses mesmos elementos. Além disso, recebe dano mínimo de qualquer ataque baseado em fogo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Fofo',
    'Monstro',
    12,
    0,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 5, "AGI": 13, "INT": 4, "WILL": 4, "PER": 13, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Maleabilidade Absoluta", "descricao_habilidade": "Pode moldar seu corpo em formas variadas e úteis (como tendas, travesseiros, para-quedas, sacos de dormir), mas nunca em formas rígidas ou cortantes como lâminas. Pode projetar pseudópodes elásticos para manipular objetos ou atacar a até 10 metros de comprimento."}, {"habilidade": "Ataque de Pseudópode", "descricao_habilidade": "Pode desferir um ataque por rodada com seus tentáculos maleáveis, causando dano igual a sua Força menos 1d6 (mecanicamente anotado no perfil original como 1d3)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Fogo-Fátuo',
    'Espírito',
    1,
    0,
    '',
    $ATTR${"CON": 1, "FOR": 1, "DEX": 0, "AGI": 16, "INT": 3, "WILL": 3, "PER": 16, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Drenagem de Vida", "descricao_habilidade": "O toque do fogo-fátuo ignora completamente o Índice de Proteção (IP) do alvo, infligindo 1 ponto de dano por rodada de contato."}, {"habilidade": "Consumir Alma", "descricao_habilidade": "Quando uma vítima chega a 0 Pontos de Vida, o bando de fogos-fátuos suga sua alma por completo na rodada seguinte. A criatura afetada não pode ser ressuscitada por métodos normais, apenas através de um Desejo. Inofensivo contra construtos, mas afeta mortos-vivos."}, {"habilidade": "Reconstituição", "descricao_habilidade": "Se for destruído, o fogo-fátuo se reforma inteiramente em um período de 3d6+3 dias em uma região próxima ao local do combate."}, {"habilidade": "Vulnerabilidade Física Mundana", "descricao_habilidade": "Embora imune à magia, qualquer ataque físico não-mágico mundano bem-sucedido que cause pelo menos 1 ponto de dano destrói a criatura instantaneamente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Formiga-Hiena',
    'Monstro',
    7,
    1,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 5, "AGI": 10, "INT": 4, "WILL": 4, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida Infecciosa", "descricao_habilidade": "Ataque corporal que causa 1d3 de dano. Qualquer criatura ferida deve realizar um Teste de Resistência; se falhar, contrai uma infecção grave que drena 1 PV por dia e impõe um redutor de -1 em todos os seus testes até que seja curada."}, {"habilidade": "Saliva Corruptora", "descricao_habilidade": "Sua saliva é extremamente infecciosa. Qualquer tipo de alimento tocado ou mordido por uma formiga-hiena torna-se imediatamente podre e imprestável para o consumo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Fungi',
    'Planta',
    7,
    0,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 7, "AGI": 7, "INT": 9, "WILL": 9, "PER": 12, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Nuvem de Esporos", "descricao_habilidade": "Em combate, pode exalar uma nuvem de esporos que afeta todas as criaturas em alcance de combate corporal (3 metros de raio). As vítimas devem fazer um Teste de Resistência; em caso de falha, deve-se rolar 2d6 na tabela de efeitos. O efeito dura uma hora ou até ser cancelado misticamente. Construtos são imunes."}, {"habilidade": "Tabela de Efeitos dos Esporos (2d6)", "descricao_habilidade": "2-3: Pânico (igual à magia); 4-5: Desmaio (igual à magia); 6: Paralisia (igual à magia); 7: Insanidade (Loucura de Atas); 8: Gagueira (Gagueira de Raviolius); 9: Cegueira (igual à magia); 10: Sono (igual à magia); 11-12: Petrificação (igual à magia)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gafanhoto-Tigre',
    'Monstro',
    27,
    4,
    '',
    $ATTR${"CON": 17, "FOR": 17, "DEX": 7, "AGI": 15, "INT": 4, "WILL": 4, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Garras", "descricao_habilidade": "Ataque físico corporal desferido com suas garras dianteiras."}, {"habilidade": "Ataque com Mordida", "descricao_habilidade": "Ataque físico corporal potente desferido com suas mandíbulas."}, {"habilidade": "Salto Predatório", "descricao_habilidade": "A criatura é capaz de realizar saltos verticais de até 6 metros de altura e 10 metros de distância para emboscar suas presas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gambá',
    'Animal',
    3,
    0,
    '',
    $ATTR${"CON": 1, "FOR": 1, "DEX": 3, "AGI": 11, "INT": 2, "WILL": 2, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corporal básico."}, {"habilidade": "Jato de Almíscar (Fedor)", "descricao_habilidade": "Quando ameaçado, o gambá ergue a cauda e projeta um jato fétido à distância. O alvo atingido sofre redutor de -1 em Agilidade por uma hora ou até se lavar. A vítima também deve fazer um Teste de Força de Vontade; falhar causa paralisia total por dois turnos (sem ser interrompida por receber danos). Se o alvo possuir Faro Aguçado, não tem direito ao teste de resistência e sofre uma penalidade adicional de -1 em todos os testes enquanto o cheiro persistir."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gárgula',
    'Construto',
    37,
    6,
    '20 M',
    $ATTR${"CON": 27, "FOR": 27, "DEX": 10, "AGI": 20, "INT": 5, "WILL": 5, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corporal duplo realizado com suas garras de pedra."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corporal realizado com suas mandíbulas de pedra."}, {"habilidade": "Voo", "descricao_habilidade": "A gárgula é capaz de erguer-se no ar e voar livremente."}, {"habilidade": "Conserto de Construto", "descricao_habilidade": "A criatura não recupera Pontos de Vida naturalmente. Ela só pode ser consertada por alguém utilizando ferramentas adequadas e a perícia Máquinas (um teste bem-sucedido restaura 1 PV a cada meia hora de trabalho)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gênio da Água',
    'Espírito',
    42,
    10,
    '',
    $ATTR${"CON": 37, "FOR": 27, "DEX": 20, "AGI": 25, "INT": 28, "WILL": 28, "PER": 24, "CAR": 18}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal duplo desferido com os punhos."}, {"habilidade": "Realizar Desejo", "descricao_habilidade": "Uma vez por dia, pode realizar a magia Desejo como uma habilidade natural, sem consumir Pontos de Vida."}, {"habilidade": "Magia Elemental e Rituais", "descricao_habilidade": "Capaz de realizar magias de todos os Caminhos, exceto Fogo. Possui dezenas ou centenas de rituais únicos adaptados para seus caminhos favoritos (Água, Humanos e Espíritos). Conhece todas as magias permitidas para seus níveis de Focus."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gênio da Terra',
    'Espírito',
    52,
    10,
    '',
    $ATTR${"CON": 47, "FOR": 42, "DEX": 20, "AGI": 25, "INT": 28, "WILL": 28, "PER": 24, "CAR": 18}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal duplo desferido com os punhos."}, {"habilidade": "Realizar Desejo", "descricao_habilidade": "Uma vez por dia, pode realizar a magia Desejo como uma habilidade natural, sem consumir Pontos de Vida."}, {"habilidade": "Magia Elemental e Rituais", "descricao_habilidade": "Capaz de realizar magias de todos os Caminhos, exceto Ar. Possui dezenas ou centenas de rituais únicos adaptados para seus caminhos favoritos (Terra, Fogo e Humanos). Conhece todas as magias permitidas para seus níveis de Focus."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gênio do Ar',
    'Espírito',
    52,
    10,
    '',
    $ATTR${"CON": 47, "FOR": 42, "DEX": 20, "AGI": 25, "INT": 28, "WILL": 28, "PER": 24, "CAR": 18}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal duplo desferido com os punhos."}, {"habilidade": "Realizar Desejo", "descricao_habilidade": "Uma vez por dia, pode realizar a magia Desejo como uma habilidade natural, sem consumir Pontos de Vida."}, {"habilidade": "Magia Elemental e Rituais", "descricao_habilidade": "Capaz de realizar magias de todos os Caminhos, exceto Terra. Possui dezenas ou centenas de rituais únicos adaptados para seus caminhos favoritos (Ar, Luz, Espíritos e Humanos). Conhece todas as magias permitidas para seus níveis de Focus."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gênio do Fogo',
    'Espírito',
    52,
    10,
    '',
    $ATTR${"CON": 47, "FOR": 37, "DEX": 20, "AGI": 25, "INT": 33, "WILL": 33, "PER": 24, "CAR": 19}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal duplo desferido com os punhos."}, {"habilidade": "Realizar Desejo", "descricao_habilidade": "Uma vez por dia, pode realizar a magia Desejo como uma habilidade natural, sem consumir Pontos de Vida."}, {"habilidade": "Magia Elemental e Rituais", "descricao_habilidade": "Capaz de realizar magias de todos os Caminhos, exceto Água. Possui dezenas ou centenas de rituais únicos adaptados para seus caminhos favoritos (Fogo, Trevas, Ar e Humanos). Conhece todas as magias permitidas para seus níveis de Focus."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gênio da Luz',
    'Espírito',
    52,
    10,
    '',
    $ATTR${"CON": 47, "FOR": 37, "DEX": 20, "AGI": 25, "INT": 28, "WILL": 30, "PER": 28, "CAR": 21}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal duplo desferido com os punhos."}, {"habilidade": "Realizar Desejo", "descricao_habilidade": "Uma vez por dia, pode realizar a magia Desejo como uma habilidade natural, sem consumir Pontos de Vida."}, {"habilidade": "Magia Elemental e Rituais", "descricao_habilidade": "Capaz de realizar magias de todos os Caminhos, exceto Trevas. Possui dezenas ou centenas de rituais únicos adaptados para seus caminhos favoritos (Luz, Ar, Espíritos e Humanos). Conhece todas as magias permitidas para seus níveis de Focus."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gênio das Trevas',
    'Espírito',
    52,
    10,
    '',
    $ATTR${"CON": 47, "FOR": 37, "DEX": 20, "AGI": 25, "INT": 28, "WILL": 30, "PER": 28, "CAR": 21}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal duplo desferido com os punhos."}, {"habilidade": "Realizar Desejo", "descricao_habilidade": "Uma vez por dia, pode realizar a magia Desejo como uma habilidade natural, sem consumir Pontos de Vida."}, {"habilidade": "Magia Elemental e Rituais", "descricao_habilidade": "Capaz de realizar magias de todos os Caminhos, exceto Luz. Possui dezenas ou centenas de rituais únicos adaptados para seus caminhos favoritos (Trevas, Água, Ar e Humanos). Conhece todas as magias permitidas para seus níveis de Focus."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ghoul',
    'Morto-Vivo',
    11,
    0,
    '',
    $ATTR${"CON": 11, "FOR": 12, "DEX": 7, "AGI": 9, "INT": 3, "WILL": 5, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corporal básico realizado com suas garras."}, {"habilidade": "Toque Paralisante", "descricao_habilidade": "O ataque do ghoul carrega uma energia paralisante baseada em sua Força. A vítima atingida fica imobilizada, permitindo que o bando ataque em vantagem."}, {"habilidade": "Lentidão de Combate", "descricao_habilidade": "Devido à sua natureza rígida e cadavérica, a criatura nunca ganha a iniciativa em combate e é incapaz de realizar esquivas."}, {"habilidade": "Dependência de Carne Humana", "descricao_habilidade": "A criatura necessita consumir carne humana periodicamente; a falta desse alimento faz com que ela enfraqueça progressivamente até desaparecer."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gigante Comum',
    'Humanoide',
    27,
    1,
    '',
    $ATTR${"CON": 22, "FOR": 22, "DEX": 7, "AGI": 8, "INT": 10, "WILL": 10, "PER": 10, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Clava", "descricao_habilidade": "Ataque físico corporal desferido com uma clava imensa."}, {"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal básico desferido com os punhos."}, {"habilidade": "Arremesso de Pedra", "descricao_habilidade": "Habilidade natural de arremessar grandes rochas para atingir alvos à distância."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gigante Bicéfalo',
    'Humanoide',
    37,
    2,
    '',
    $ATTR${"CON": 32, "FOR": 32, "DEX": 7, "AGI": 8, "INT": 10, "WILL": 10, "PER": 10, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga Corpórea Dupla", "descricao_habilidade": "Como cada uma de suas cabeças comanda um braço de forma independente, a criatura é capaz de realizar dois ataques físicos baseados em sua Força por turno."}, {"habilidade": "Arremesso de Pedra", "descricao_habilidade": "Habilidade natural de arremessar grandes rochas para atingir alvos à distância."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gigante Real',
    'Humanoide',
    62,
    4,
    '',
    $ATTR${"CON": 43, "FOR": 43, "DEX": 7, "AGI": 8, "INT": 10, "WILL": 6, "PER": 10, "CAR": 4}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque Massivo com Clava", "descricao_habilidade": "Desfere um golpe devastador usando uma clava proporcional ao seu imenso tamanho."}, {"habilidade": "Arremesso de Pedra Colossal", "descricao_habilidade": "Capaz de arremessar rochas imensas à distância, funcionando de forma similar a um cerco biológico."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ciclope',
    'Humanoide',
    37,
    2,
    '',
    $ATTR${"CON": 33, "FOR": 33, "DEX": 7, "AGI": 8, "INT": 16, "WILL": 16, "PER": 10, "CAR": 4}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Clava", "descricao_habilidade": "Ataque corporal desferido com uma grande clava."}, {"habilidade": "Arremesso de Pedra", "descricao_habilidade": "Habilidade natural de arremessar grandes rochas para atingir alvos à distância."}, {"habilidade": "Olho Mágico", "descricao_habilidade": "O olho único do ciclope concede habilidades visuais sobrenaturais místicas permanentes."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gnoll',
    'Humanoide',
    10,
    0,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 10, "AGI": 10, "INT": 10, "WILL": 10, "PER": 10, "CAR": 4}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Arma", "descricao_habilidade": "Desfere ataques utilizando lanças rústicas, espadas capturadas de inimigos ou clavas de madeira."}, {"habilidade": "Arremesso de Lança", "descricao_habilidade": "Capacidade de utilizar suas lanças rústicas como armas de arremesso à distância."}, {"habilidade": "Código de Honra da Rendição", "descricao_habilidade": "Os gnolls consideram a rendição um ato sagrado e de honra. Eles sempre aceitam a rendição de um inimigo. Da mesma forma, quando percebem que estão em desvantagem ou que o oponente é muito superior, eles se rendem imediatamente esperando clemência ou integração. Atacar um gnoll que se rendeu (ou trair uma rendição) transforma o agressor em um alvo prioritário, fazendo com que ele seja caçado implacavelmente por todas as matilhas da região."}, {"habilidade": "Covardia / Dependência de Número", "descricao_habilidade": "Não possuem muita coragem individual, preferindo evitar combates diretos e equilibrados. Confiam estritamente em emboscadas e na superioridade numérica para garantir a vitória."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Goblin Soldado',
    'Humanoide',
    7,
    0,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 7, "AGI": 10, "INT": 7, "WILL": 7, "PER": 14, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Visão no Escuro", "descricao_habilidade": "Enxergam perfeitamente na escuridão total, assim como anões e elfos."}, {"habilidade": "Combate de Infantaria", "descricao_habilidade": "Desfere ataques coordenados utilizando armas simples. Possui bônus de Ataque 25 e Defesa 25."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Goblin Subchefe / Chefe',
    'Humanoide',
    9,
    0,
    '',
    $ATTR${"CON": 9, "FOR": 9, "DEX": 9, "AGI": 10, "INT": 8, "WILL": 8, "PER": 15, "CAR": 8}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Visão no Escuro", "descricao_habilidade": "Enxergam perfeitamente na escuridão total, assim como anões e elfos."}, {"habilidade": "Liderança de Bando", "descricao_habilidade": "Comanda grupos de assalto com táticas selvagens. Possui bônus de Ataque 35 e Defesa 35."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Goblin Cavaleiro',
    'Humanoide',
    13,
    3,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 10, "AGI": 10, "INT": 8, "WILL": 8, "PER": 15, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Visão no Escuro", "descricao_habilidade": "Enxergam perfeitamente na escuridão total, assim como anões e elfos."}, {"habilidade": "Combate Montado", "descricao_habilidade": "Desfere investidas rápidas em cima de uma montaria loba-das-cavernas. Possui bônus de Ataque 45 e Defesa 20."}, {"habilidade": "Empatia com Lobos", "descricao_habilidade": "Afinidade natural e capacidade de treinar e comandar lobos e feras similares."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Goblin Herói',
    'Humanoide',
    14,
    4,
    '',
    $ATTR${"CON": 14, "FOR": 14, "DEX": 13, "AGI": 10, "INT": 8, "WILL": 8, "PER": 15, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Visão no Escuro", "descricao_habilidade": "Enxergam perfeitamente na escuridão total, assim como anões e elfos."}, {"habilidade": "Esgrima Veterana", "descricao_habilidade": "Exibe maestria incomum com a espada em combate. Possui bônus de Ataque 45 e Defesa 30."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Grama Carnívora',
    'Planta',
    6,
    0,
    '',
    $ATTR${"CON": 10, "FOR": 12, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Enredar e Imobilizar", "descricao_habilidade": "Ao pisar na grama (andando ou parado), a vítima é agarrada. Exige um teste bem-sucedido de FOR para avançar 1 passo. Falhar no teste derruba a vítima; falhar em 2 testes seguidos imobiliza-a totalmente no chão."}, {"habilidade": "Digestão Enzimática", "descricao_habilidade": "Uma vez que a vítima esteja totalmente amarrada ao chão, a grama secreta uma enzima digestiva que causa 1 ponto de dano por turno até a morte do alvo."}, {"habilidade": "Dano Compartilhado", "descricao_habilidade": "Causar 1d6 de dano a uma seção (1m²) faz a grama soltar a vítima, porém qualquer dano provocado à grama também é aplicado à vítima presa nela. Dano por Eletricidade pode ser usado sem esse risco direto."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hobgoblin Soldado',
    'Humanoide',
    13,
    2,
    '',
    $ATTR${"CON": 11, "FOR": 11, "DEX": 10, "AGI": 10, "INT": 8, "WILL": 8, "PER": 15, "CAR": 8}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Combate Marcial", "descricao_habilidade": "Treinamento militar rígido. Desfere ataques com bônus de Ataque 35 e Defesa 30."}, {"habilidade": "Conhecimento Técnico", "descricao_habilidade": "Familiaridade básica com engenharia militar e manutenção de máquinas de guerra."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hobgoblin Arqueiro',
    'Humanoide',
    13,
    1,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 11, "AGI": 10, "INT": 8, "WILL": 8, "PER": 15, "CAR": 8}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Tiro de Cobertura", "descricao_habilidade": "Especialista em disparos precisos à distância. Possui bônus de Ataque 40 e Defesa 0."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hobgoblin Sargento / Capitão',
    'Humanoide',
    18,
    3,
    '',
    $ATTR${"CON": 15, "FOR": 16, "DEX": 10, "AGI": 12, "INT": 10, "WILL": 10, "PER": 15, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Comando Tático", "descricao_habilidade": "Liderança militar agressiva que extrai eficiência máxima da tropa. Possui bônus de Ataque 45 e Defesa 40."}, {"habilidade": "Especialização em Máquinas", "descricao_habilidade": "Proficiência avançada na operação, reparo e direcionamento estratégico de catapultas e maquinários de cerco."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hobgoblin Xamã',
    'Humanoide',
    13,
    0,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 10, "AGI": 10, "INT": 13, "WILL": 17, "PER": 15, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Defesa Espiritual", "descricao_habilidade": "Utiliza seu cajado e presença mística para combate a curta distância. Possui bônus de Ataque 35 e Defesa 30."}, {"habilidade": "Clericato de Guerra", "descricao_habilidade": "Capacidade de conjurar preces e magias divinas fundamentadas nos caminhos de Água, Espíritos, Terra e Trevas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Bugbear Soldado',
    'Humanoide',
    16,
    1,
    '',
    $ATTR${"CON": 13, "FOR": 17, "DEX": 10, "AGI": 10, "INT": 7, "WILL": 7, "PER": 14, "CAR": 8}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Passo Silencioso", "descricao_habilidade": "Apesar de seu tamanho e andar desajeitado, conseguem se mover em grande silêncio para desferir ataques de surpresa."}, {"habilidade": "Combate de Vanguarda", "descricao_habilidade": "Desfere golpes devastadores utilizando armas pesadas com bônus de Ataque 45 e Defesa 30."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Bugbear Capitão',
    'Humanoide',
    23,
    3,
    '',
    $ATTR${"CON": 19, "FOR": 18, "DEX": 15, "AGI": 14, "INT": 12, "WILL": 13, "PER": 14, "CAR": 14}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Passo Silencioso", "descricao_habilidade": "Apesar de seu tamanho e andar desajeitado, conseguem se mover em grande silêncio para desferir ataques de surpresa."}, {"habilidade": "Comando Brutal", "descricao_habilidade": "Impõe disciplina nas tropas através de força física intimidadora. Desfere ataques com bônus de Ataque 55 e Defesa 40."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Bugbear Xamã',
    'Humanoide',
    18,
    0,
    '',
    $ATTR${"CON": 14, "FOR": 14, "DEX": 14, "AGI": 10, "INT": 14, "WILL": 16, "PER": 15, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Passo Silencioso", "descricao_habilidade": "Apesar de seu tamanho e andar desajeitado, conseguem se mover em grande silêncio para desferir ataques de surpresa."}, {"habilidade": "Combate com Cajado", "descricao_habilidade": "Desfere golpes rústicos focados em canalização. Possui bônus de Ataque 45 e Defesa 30 e causa dano de 1d6 + modificador de força."}, {"habilidade": "Clericato de Feras", "descricao_habilidade": "Capacidade de conjurar magias e preces de suporte baseadas nos caminhos de Água, Espíritos, Terra e Trevas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Galhada',
    'Construto',
    12,
    0,
    '',
    $ATTR${"CON": 12, "FOR": 10, "DEX": 6, "AGI": 8, "INT": 4, "WILL": 4, "PER": 11, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Chifres", "descricao_habilidade": "Ataque físico realizado apenas pelos machos. Teste: 40/0. Dano: 1d6."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Espada-da-Floresta',
    'Construto',
    20,
    1,
    '',
    $ATTR${"CON": 15, "FOR": 14, "DEX": 8, "AGI": 8, "INT": 8, "WILL": 4, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque corporal básico com suas garras vegetais. Teste: 50/50. Dano: 1d10."}, {"habilidade": "Espada de Espinhos", "descricao_habilidade": "Utiliza uma espada longa de madeira muito dura e coberta de espinhos. Trata-se de uma Arma Especial que perde suas propriedades se afastada da criatura por mais de sete dias. Se perdida ou desarmada, a criatura faz brotar outra de seu antebraço direito em uma semana."}, {"habilidade": "Crescimento Energético", "descricao_habilidade": "Ataques luminosos ou elétricos direcionados a esta criatura fazem com que ela cresça, curando-a e fazendo com que ganhe os Pontos de Vida que deveria perder com o ataque."}, {"habilidade": "Camuflagem Natural", "descricao_habilidade": "A criatura é quase invisível quando está inserida em seu ambiente natural."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Árvore-Matilha',
    'Construto',
    62,
    3,
    '',
    $ATTR${"CON": 30, "FOR": 35, "DEX": 6, "AGI": 10, "INT": 7, "WILL": 4, "PER": 12, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordidas Múltiplas", "descricao_habilidade": "A criatura ataca mordendo com suas cabeças. Ela possui exatamente uma cabeça ativa para cada 6 PVs de vida atual. Cada vez que perde 6 PVs, uma de suas cabeças morre. Ataques desferidos diretamente contra o tronco central são mecanicamente inúteis. Teste: 75/0. Dano: 1d10 por mordida."}, {"habilidade": "Uivo Aterrador", "descricao_habilidade": "Pode emitir um uivo assustador uma vez por dia para cada cabeça viva que possuir. Todas as vítimas na área devem ser bem-sucedidas em um Teste de Resistência ou fugirão apavoradas por dez rodadas."}, {"habilidade": "Sentidos Sobrenaturais", "descricao_habilidade": "Apesar de não possuir olhos físicos, a criatura é capaz de enxergar perfeitamente no escuro total e detectar elementos invisíveis."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Golfinho',
    'Animal',
    22,
    2,
    '',
    $ATTR${"CON": 22, "FOR": 22, "DEX": 0, "AGI": 12, "INT": 4, "WILL": 4, "PER": 16, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pancada", "descricao_habilidade": "Ataque físico corporal básico. Teste: 55/0. Dano: 1d6."}, {"habilidade": "Disparo Atordoador (Sonar)", "descricao_habilidade": "Ataque sônico direcionado ao sistema nervoso do alvo que não causa dano físico. A vítima deve realizar um Teste de Resistência -1; se falhar, fica inconsciente ou incapacitada por 10 minutos (reduzido em 1 minuto para cada ponto de Resistência que o alvo possuir)."}, {"habilidade": "Guincho de Alta-Frequência", "descricao_habilidade": "Habilidade defensiva extrema utilizada apenas quando o golfinho está muito assustado ou sob ameaça real de morte. Emite um som agudo devastador capaz de dilacerar a carne do alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gondo',
    'Monstro',
    32,
    2,
    '',
    $ATTR${"CON": 22, "FOR": 22, "DEX": 18, "AGI": 20, "INT": 4, "WILL": 4, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras (x2)", "descricao_habilidade": "Ataque físico corporal duplo utilizando suas garras afiadas. Teste: 75/60. Dano: 1d6+5."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corporal básico. Teste: 60/0. Dano: 1d6."}, {"habilidade": "Chifres", "descricao_habilidade": "Ataque físico alternativo, geralmente reservado para disputas reprodutivas. Teste: 75/0. Dano: 1d6+3."}, {"habilidade": "Ataque de Carga (Chifres)", "descricao_habilidade": "Ataque de investida com os chifres. Requer pelo menos 10 metros de distância para correr. Causa dano de 2d6+6 (ou dano dobrado se puder correr livremente)."}, {"habilidade": "Invisibilidade na Escuridão", "descricao_habilidade": "A criatura gera uma aura mágica que camufla seu corpo à noite, concedendo 90% de Invisibilidade na escuridão."}, {"habilidade": "Passos Sísmicos", "descricao_habilidade": "Apesar de sua camuflagem mágica e de não produzir ruído sonoro, seus passos provocam leves tremores na terra que podem denunciar sua presença."}, {"habilidade": "Fraqueza Diurna", "descricao_habilidade": "Qualquer ação realizada durante o período diurno, mesmo em locais escuros, sofre um redutor de -1."}, {"habilidade": "Heliofobia", "descricao_habilidade": "Quando exposto diretamente à luz solar, sofre um redutor de -3 em suas ações e tenta fugir imediatamente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Górgon',
    'Monstro',
    55,
    6,
    '',
    $ATTR${"CON": 41, "FOR": 42, "DEX": 3, "AGI": 14, "INT": 0, "WILL": 0, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Chifres", "descricao_habilidade": "Ataque físico de chifrada corporal básica. Teste: 75/0. Dano: 2d6+8 (calculado como Força + 1d6)."}, {"habilidade": "Ataque Especial: Carga", "descricao_habilidade": "Investida violenta na qual a criatura corre em direção ao alvo. Requer pelo menos 10 metros de distância. Aplica o redutor normal de H-1. Teste: 50/0. Dano: 5d6+5 (calculado como Força + 3d6)."}, {"habilidade": "Bafo de Gás Venenoso (Petrificação)", "descricao_habilidade": "Disparo de uma nuvem de gás expelida pela boca e fendas da armadura corporal, cobrindo uma área de 3 metros de raio. Todas as vítimas na área devem ser bem-sucedidas em um Teste de Resistência ou serão transformadas em pedra (efeito idêntico ao da magia Petrificação). Recarga: 1 vez a cada 5 rodadas."}, {"habilidade": "Imunidade a Petrificação", "descricao_habilidade": "O próprio górgon é imune aos efeitos de petrificação causados por seu gás ou por fontes externas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Leão',
    'Animal',
    42,
    1,
    '',
    $ATTR${"CON": 30, "FOR": 30, "DEX": 3, "AGI": 20, "INT": 2, "WILL": 2, "PER": 20, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras (x2)", "descricao_habilidade": "Ataque físico corporal duplo. Teste: 75/60. Dano: 1d6+9."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corporal básico. Teste: 65/0. Dano: 2d6."}, {"habilidade": "Salto", "descricao_habilidade": "A criatura é capaz de saltar grandes distâncias ativamente."}, {"habilidade": "Sentidos Aguçados", "descricao_habilidade": "Possui sentidos extremamente apurados."}, {"habilidade": "Visão Noturna", "descricao_habilidade": "Capacidade de enxergar no escuro."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Tigre',
    'Animal',
    42,
    1,
    '',
    $ATTR${"CON": 29, "FOR": 29, "DEX": 3, "AGI": 19, "INT": 2, "WILL": 2, "PER": 20, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras (x2)", "descricao_habilidade": "Ataque físico corporal duplo. Teste: 70/60. Dano: 1d6+8."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corporal básico. Teste: 75/0. Dano: 2d6+1."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Leopardo',
    'Animal',
    20,
    0,
    '',
    $ATTR${"CON": 15, "FOR": 15, "DEX": 3, "AGI": 19, "INT": 2, "WILL": 2, "PER": 20, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras (x2)", "descricao_habilidade": "Ataque físico corporal duplo. Teste: 60/60. Dano: 1d6+3."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corporal básico. Teste: 55/0. Dano: 2d6."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Babuíno',
    'Animal',
    18,
    0,
    '',
    $ATTR${"CON": 15, "FOR": 15, "DEX": 9, "AGI": 18, "INT": 3, "WILL": 3, "PER": 20, "CAR": 8}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corporal com suas garras. Teste: 60/60. Dano: 1d6+3."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Chimpanzé',
    'Animal',
    17,
    0,
    '',
    $ATTR${"CON": 18, "FOR": 17, "DEX": 10, "AGI": 20, "INT": 3, "WILL": 3, "PER": 20, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico corporal desarmado. Teste: 70/60. Dano: 1d6+5."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corporal básico. Teste: 75/0. Dano: 1d3."}, {"habilidade": "Arremessar Esterco", "descricao_habilidade": "Ação executada como manifestação de irritação contra alvos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gorila',
    'Animal',
    22,
    1,
    '',
    $ATTR${"CON": 26, "FOR": 30, "DEX": 10, "AGI": 18, "INT": 3, "WILL": 3, "PER": 15, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga (x2)", "descricao_habilidade": "Ataque físico corporal duplo com golpes desarmados. Teste: 50/50. Dano: 1d6+5."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Orangotango',
    'Animal',
    75,
    6,
    '',
    $ATTR${"CON": 53, "FOR": 52, "DEX": 10, "AGI": 9, "INT": 3, "WILL": 3, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras (x2)", "descricao_habilidade": "Ataque físico corporal duplo com seus membros superiores. Teste: 60/50. Dano: 3d6+14."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Gorila Gigante',
    'Monstro',
    75,
    6,
    '',
    $ATTR${"CON": 53, "FOR": 52, "DEX": 10, "AGI": 9, "INT": 3, "WILL": 3, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras (x2)", "descricao_habilidade": "Ataque físico corporal duplo esmagador utilizando seus imensos punhos/garras. Teste: 60/50. Dano: 3d6+14."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Grifo',
    'Animal',
    31,
    1,
    '25 M',
    $ATTR${"CON": 30, "FOR": 33, "DEX": 3, "AGI": 12, "INT": 3, "WILL": 13, "PER": 20, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "A criatura é capaz de voar ativamente a uma velocidade impressionante de 25m/s."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico corporal com as garras (x2). Teste: 60/60. Dano: 1d10+5."}, {"habilidade": "Bicada", "descricao_habilidade": "Ataque físico corporal básico com o bico. Teste: 65/0. Dano: 1d6 (dano calculado como Força + 1d6)."}, {"habilidade": "Obsessão por Carne de Cavalo", "descricao_habilidade": "Cavalos são o prato favorito dos grifos. Evitar que um grifo ataque qualquer cavalo próximo exige que o domador/mestre passe em um Teste de Habilidade com redutor de -3 (H-3)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Guerreiro da Luz',
    'Construto',
    33,
    6,
    '',
    $ATTR${"CON": 27, "FOR": 27, "DEX": 14, "AGI": 14, "INT": 14, "WILL": 14, "PER": 20, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Espada de Vidro Sagrada", "descricao_habilidade": "Ataque corporal com sua espada transparente (x2). Trata-se de uma Arma Especial Sagrada e Vorpal. Teste: 80/60. Dano: 1d10+6. A arma está integrada ao corpo do golem e só pode ser removida com sua destruição total."}, {"habilidade": "Escudo de Vidro (Reflexão)", "descricao_habilidade": "O escudo integrado ao corpo do golem possui a capacidade de refletir ataques à distância, conforme as regras da vantagem Reflexão."}, {"habilidade": "Raio de Luz", "descricao_habilidade": "Pode disparar pela fenda do elmo um feixe luminoso concentrado. Limitação: até três vezes ao dia. Dano: 4d6+6."}, {"habilidade": "Código de Honra", "descricao_habilidade": "Segue o Código de Honra dos Heróis e da Honestidade."}, {"habilidade": "Vulnerabilidade a Trevas", "descricao_habilidade": "A criatura sofre mais dano quando exposta a magias ou ataques baseados em Trevas."}, {"habilidade": "Imunidade a Magias do Caminho da Luz", "descricao_habilidade": "Totalmente invulnerável a feitiços e magias pertencentes ao Caminho da Luz."}, {"habilidade": "Imunidade a Efeitos Luminosos", "descricao_habilidade": "Não pode ser danificado ou cegado por nenhum ataque ou magia baseado em Luz."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Halfling',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Arremesso de Pedras", "descricao_habilidade": "A técnica de combate e esporte favorita da raça, sendo a forma mais eficiente de ataque para halflings aventureiros."}, {"habilidade": "Resistência à Magia", "descricao_habilidade": "Possuem uma resistência natural contra efeitos mágicos."}, {"habilidade": "Atributos Raciais (+1 Agilidade)", "descricao_habilidade": "Recebem bônus de +1 em Agilidade (até o máximo de AGI 5)."}, {"habilidade": "Modelo Especial", "descricao_habilidade": "Devido ao tamanho reduzido, não conseguem utilizar roupas, armaduras ou equipamentos fabricados para humanos."}, {"habilidade": "Fraqueza Física (-2 em Força)", "descricao_habilidade": "Sofrem redutor de -2 em sua Força (até o mínimo 0)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Harpia',
    'Monstro',
    31,
    2,
    '20 M',
    $ATTR${"CON": 27, "FOR": 23, "DEX": 14, "AGI": 14, "INT": 18, "WILL": 18, "PER": 18, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "A criatura é capaz de voar de forma natural."}, {"habilidade": "Canto Mágico Hipnótico", "descricao_habilidade": "A harpia atrai suas vítimas utilizando um canto mágico idêntico à magia Canto da Sereia, sem gastar Pontos de Vida. Se mais de uma harpia cantar em conjunto, as vítimas sofrem redutor de -1 em seu Teste de Resistência para cada harpia extra presente. Caso a vítima resista ao efeito uma vez, torna-se permanentemente imune ao canto deste ou de qualquer outro bando."}, {"habilidade": "Canto de Dominação", "descricao_habilidade": "As harpias podem usar seu canto alternativamente para conjurar a magia Dominação Total contra um único alvo por vez. Exige um Teste Normal de Resistência da vítima, aplicando-se um redutor de -1 para cada harpia extra participando do coro. O efeito dura apenas enquanto o bando mantiver o canto (que pode ser sustentado por até 1d6 horas). Caso a vítima resista uma vez, torna-se permanentemente imune."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hidra Branca',
    'Monstro',
    50,
    5,
    '',
    $ATTR${"CON": 43, "FOR": 23, "DEX": 4, "AGI": 11, "INT": 3, "WILL": 13, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Crescimento de Cabeças", "descricao_habilidade": "Sempre que sofrer 5 ou mais pontos de vida em dano por ataques cortantes, uma cabeça é decepada. No turno seguinte, nascem duas cabeças no lugar, aumentando sua Resistência em +1 e somando +5 PV ao total (limite máximo de 10 cabeças)."}, {"habilidade": "Mapeamento de Ataques por Cabeça", "descricao_habilidade": "A criatura possui uma quantidade de ataques de mordida equivalente ao seu número atual de cabeças. Suas cabeças possuem um alcance de ataque de 10 metros."}, {"habilidade": "Sopro de Gelo", "descricao_habilidade": "Pode exalar um cone de frio e gelo de 10 metros de comprimento por 8 metros de largura na base. Causa 6d6+6 de dano de frio a todos na área. Alvos que passem no teste de esquiva ainda sofrem metade do dano. Pode ser usado 3 vezes ao dia."}, {"habilidade": "Tiro Múltiplo", "descricao_habilidade": "Ao usar seu sopro elemental, pode dividir seu poder de fogo total em disparos individuais de 1d6 por cabeça contra alvos diferentes, ou concentrar o dano total em um único alvo. Não exige teste de acerto contra o primeiro alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hidra Negra',
    'Monstro',
    50,
    5,
    '',
    $ATTR${"CON": 43, "FOR": 23, "DEX": 4, "AGI": 11, "INT": 3, "WILL": 13, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Crescimento de Cabeças", "descricao_habilidade": "Sempre que sofrer 5 ou mais pontos de vida em dano por ataques cortantes, uma cabeça é decepada. No turno seguinte, nascem duas cabeças no lugar, aumentando sua Resistência em +1 e somando +5 PV ao total (limite máximo de 10 cabeças)."}, {"habilidade": "Mapeamento de Ataques por Cabeça", "descricao_habilidade": "A criatura possui uma quantidade de ataques de mordida equivalente ao seu número atual de cabeças. Suas cabeças possuem um alcance de ataque de 10 metros."}, {"habilidade": "Sopro de Veneno", "descricao_habilidade": "Pode exalar um cone de veneno químico de 10 metros de comprimento por 8 metros de largura na base. Causa 6d6+6 de dano químico/venenoso a todos na área. Alvos que passem no teste de esquiva ainda sofrem metade do dano. Pode ser usado 3 vezes ao dia."}, {"habilidade": "Tiro Múltiplo", "descricao_habilidade": "Ao usar seu sopro elemental, pode dividir seu poder de fogo total em disparos individuais de 1d6 por cabeça contra alvos diferentes, ou concentrar o dano total em um único alvo. Não exige teste de acerto contra o primeiro alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hidra Verde',
    'Monstro',
    50,
    5,
    '',
    $ATTR${"CON": 43, "FOR": 23, "DEX": 4, "AGI": 11, "INT": 3, "WILL": 13, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Crescimento de Cabeças", "descricao_habilidade": "Sempre que sofrer 5 ou mais pontos de vida em dano por ataques cortantes, uma cabeça é decepada. No turno seguinte, nascem duas cabeças no lugar, aumentando sua Resistência em +1 e somando +5 PV ao total (limite máximo de 10 cabeças)."}, {"habilidade": "Mapeamento de Ataques por Cabeça", "descricao_habilidade": "A criatura possui uma quantidade de ataques de mordida equivalente ao seu número atual de cabeças. Suas cabeças possuem um alcance de ataque de 10 metros."}, {"habilidade": "Sopro de Ácido", "descricao_habilidade": "Pode exalar um cone de ácido químico corrosivo de 10 metros de comprimento por 8 metros de largura na base. Causa 6d6+6 de dano de ácido a todos na área. Alvos que passem no teste de esquiva ainda sofrem metade do dano. Pode ser usado 3 vezes ao dia."}, {"habilidade": "Tiro Múltiplo", "descricao_habilidade": "Ao usar seu sopro elemental, pode dividir seu poder de fogo total em disparos individuais de 1d6 por cabeça contra alvos diferentes, ou concentrar o dano total em um único alvo. Não exige teste de acerto contra o primeiro alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hidra Azul',
    'Monstro',
    50,
    5,
    '',
    $ATTR${"CON": 43, "FOR": 23, "DEX": 4, "AGI": 11, "INT": 3, "WILL": 13, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Crescimento de Cabeças", "descricao_habilidade": "Sempre que sofrer 5 ou mais pontos de vida em dano por ataques cortantes, uma cabeça é decepada. No turno seguinte, nascem duas cabeças no lugar, aumentando sua Resistência em +1 e somando +5 PV ao total (limite máximo de 10 cabeças)."}, {"habilidade": "Mapeamento de Ataques por Cabeça", "descricao_habilidade": "A criatura possui uma quantidade de ataques de mordida equivalente ao seu número atual de cabeças. Suas cabeças possuem um alcance de ataque de 10 metros."}, {"habilidade": "Sopro de Relâmpago", "descricao_habilidade": "Pode exalar um cone de energia elétrica e relâmpagos de 10 metros de comprimento por 8 metros de largura na base. Causa 6d6+6 de dano elétrico a todos na área. Alvos que passem no teste de esquiva ainda sofrem metade do dano. Pode ser usado 3 vezes ao dia."}, {"habilidade": "Tiro Múltiplo", "descricao_habilidade": "Ao usar seu sopro elemental, pode dividir seu poder de fogo total em disparos individuais de 1d6 por cabeça contra alvos diferentes, ou concentrar o dano total em um único alvo. Não exige teste de acerto contra o primeiro alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hidra Marinha',
    'Monstro',
    50,
    5,
    '',
    $ATTR${"CON": 43, "FOR": 23, "DEX": 4, "AGI": 11, "INT": 3, "WILL": 13, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Crescimento de Cabeças", "descricao_habilidade": "Sempre que sofrer 5 ou mais pontos de vida em dano por ataques cortantes, uma cabeça é decepada. No turno seguinte, nascem duas cabeças no lugar, aumentando sua Resistência em +1 e somando +5 PV ao total (limite máximo de 10 cabeças)."}, {"habilidade": "Mapeamento de Ataques por Cabeça", "descricao_habilidade": "A criatura possui uma quantidade de ataques de mordida equivalente ao seu número atual de cabeças. Suas cabeças possuem um alcance de ataque de 10 metros."}, {"habilidade": "Sopro de Água Fervente", "descricao_habilidade": "Pode exalar um cone de água superaquecida a alta pressão de 10 metros de comprimento por 8 metros de largura na base. Causa 6d6+6 de dano químico/fogo/calor a todos na área. Alvos que passem no teste de esquiva ainda sofrem metade do dano. Pode ser usado 3 vezes ao dia."}, {"habilidade": "Tiro Múltiplo", "descricao_habilidade": "Ao usar seu sopro elemental, pode dividir seu poder de fogo total em disparos individuais de 1d6 por cabeça contra alvos diferentes, ou concentrar o dano total em um único alvo. Não exige teste de acerto contra o primeiro alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hidra Vermelha',
    'Monstro',
    50,
    5,
    '',
    $ATTR${"CON": 43, "FOR": 23, "DEX": 4, "AGI": 11, "INT": 3, "WILL": 13, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Crescimento de Cabeças", "descricao_habilidade": "Sempre que sofrer 5 ou mais pontos de vida em dano por ataques cortantes, uma cabeça é decepada. No turno seguinte, nascem duas cabeças no lugar, aumentando sua Resistência em +1 e somando +5 PV ao total (limite máximo de 10 cabeças)."}, {"habilidade": "Mapeamento de Ataques por Cabeça", "descricao_habilidade": "A criatura possui uma quantidade de ataques de mordida equivalente ao seu número atual de cabeças. Suas cabeças possuem um alcance de ataque de 10 metros."}, {"habilidade": "Sopro de Fogo", "descricao_habilidade": "Pode exalar um cone de chamas intensas de 10 metros de comprimento por 8 metros de largura na base. Causa 6d6+6 de dano de fogo a todos na área. Alvos que passem no teste de esquiva ainda sofrem metade do dano. Pode ser usado 3 vezes ao dia."}, {"habilidade": "Tiro Múltiplo", "descricao_habilidade": "Ao usar seu sopro elemental, pode dividir seu poder de fogo total em disparos individuais de 1d6 por cabeça contra alvos diferentes, ou concentrar o dano total em um único alvo. Não exige teste de acerto contra o primeiro alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Hipogrifo',
    'Monstro',
    66,
    2,
    '',
    $ATTR${"CON": 36, "FOR": 26, "DEX": 18, "AGI": 16, "INT": 16, "WILL": 16, "PER": 20, "CAR": 18}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "O hipogrifo é capaz de voar de forma natural e nunca se cansa durante o voo."}, {"habilidade": "Montaria do deus do Caos", "descricao_habilidade": "Apenas personagens que possuem a desvantagem Insano podem cavalgar o hipogrifo com segurança. Qualquer personagem são que tente cavalgá-lo deve passar em um Teste de Resistência ou se tornará Insano imediatamente."}, {"habilidade": "Imortalidade do Caos", "descricao_habilidade": "Caso o hipogrifo seja destruído, ele sempre ressuscitará após uma semana, recriado pelo deus do Caos."}, {"habilidade": "Ataque Múltiplo", "descricao_habilidade": "O hipogrifo é capaz de desferir ataques rápidos e adicionais combinando suas garras e bico, raramente errando seus alvos."}, {"habilidade": "Forma Humana", "descricao_habilidade": "O hipogrifo pode se transformar em um jovem cigano adornado com joias e roupas coloridas que se diverte propondo enigmas a aventureiros. Ele é capaz de falar em ambas as formas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homem-Escorpião',
    'Monstro',
    23,
    2,
    '',
    $ATTR${"CON": 23, "FOR": 19, "DEX": 4, "AGI": 14, "INT": 12, "WILL": 12, "PER": 18, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pinçadas Aprisionantes", "descricao_habilidade": "Caso a criatura acerte os dois ataques de pinça no mesmo turno contra o mesmo alvo, a vítima fica presa e incapaz de lutar até obter sucesso em um Teste de Força."}, {"habilidade": "Ferrada Certeira", "descricao_habilidade": "O homem-escorpião pode atacar automaticamente com seu ferrão venenoso, sem necessidade de testes, qualquer alvo que esteja atualmente preso por suas pinças."}, {"habilidade": "Ataque Especial com Cauda", "descricao_habilidade": "Realiza um único ataque com a cauda por turno que recebe um bônus de Força (+2 de dano), mas sofre uma penalidade de Habilidade (-1 para acertar)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Escorpião-Gigante',
    'Monstro',
    33,
    3,
    '',
    $ATTR${"CON": 22, "FOR": 22, "DEX": 4, "AGI": 14, "INT": 2, "WILL": 2, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pinçadas Aprisionantes", "descricao_habilidade": "Ao acertar os dois ataques de pinça no mesmo turno contra o mesmo alvo, a vítima fica presa e incapaz de lutar até obter sucesso em um Teste de Força."}, {"habilidade": "Ferrada Certeira", "descricao_habilidade": "Pode atacar automaticamente com seu ferrão venenoso, sem necessidade de testes de acerto, qualquer alvo que esteja atualmente preso por suas pinças."}, {"habilidade": "Veneno de Escorpião", "descricao_habilidade": "Vítimas atingidas pelo ferrão devem fazer um Teste de Resistência com bônus de +1. Se falharem, sofrem um dano extra de 3d6 pontos de vida."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homem-Lagarto',
    'Monstro',
    17,
    1,
    '',
    $ATTR${"CON": 13, "FOR": 14, "DEX": 12, "AGI": 12, "INT": 9, "WILL": 9, "PER": 15, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homem-Morcego',
    'Monstro',
    10,
    0,
    '10 M',
    $ATTR${"CON": 10, "FOR": 11, "DEX": 10, "AGI": 10, "INT": 6, "WILL": 6, "PER": 15, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "O homem-morcego é capaz de voar de forma natural."}, {"habilidade": "Língua Flexível", "descricao_habilidade": "Possui uma língua de 1 metro extremamente maleável que compensa a ausência de mãos funcionais, permitindo a manipulação de objetos e alimentos."}, {"habilidade": "Escalada Furtiva", "descricao_habilidade": "Graças a um grande polegar em formato de garra, a criatura é capaz de escalar árvores e superfícies rochosas com facilidade."}, {"habilidade": "Bombardeio de Guano", "descricao_habilidade": "Para afastar invasores de seu território sem entrar em combate direto, o bando sobrevoa os alvos de grande altitude e deixa cair esterco sobre eles. O ataque é inofensivo, mas pode apagar tochas (evitado com um teste de Habilidade) e bloqueia totalmente o olfato do personagem até que ele se limpe."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Morcego-Vampiro',
    'Monstro',
    21,
    1,
    '10 M',
    $ATTR${"CON": 16, "FOR": 19, "DEX": 10, "AGI": 15, "INT": 10, "WILL": 10, "PER": 25, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "O morcego-vampiro é capaz de voar de forma natural."}, {"habilidade": "Sentidos Aguçados", "descricao_habilidade": "Possui percepção extra-sensorial muito desenvolvida para detectar presas em cavernas completamente escuras."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homem-Serpente',
    'Monstro',
    21,
    1,
    '',
    $ATTR${"CON": 19, "FOR": 21, "DEX": 10, "AGI": 20, "INT": 12, "WILL": 12, "PER": 15, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Máscara Ilusória", "descricao_habilidade": "Capacidade natural de assumir um disfarce mágico ilusório de uma única pessoa humanoide (como um humano, elfo ou anão específico)."}, {"habilidade": "Expelir Enzima Ácida", "descricao_habilidade": "Ataque químico à distancia que causa dano corrosivo equivalente a um disparo básico."}, {"habilidade": "Veneno Paralisante", "descricao_habilidade": "Ataque bucal que expele um veneno paralisante (efeito idêntico à Vantagem Paralisia), exigindo Força de Defesa 40 do alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homúnculo',
    'Construto',
    8,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 9, "DEX": 10, "AGI": 20, "INT": 0, "WILL": 0, "PER": 15, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "O homúnculo é capaz de voar de forma natural e muito veloz."}, {"habilidade": "Picada Venenosa", "descricao_habilidade": "Alguns homúnculos podem injetar um veneno letal em suas vítimas. O alvo deve ter sucesso em um Teste de Resistência ou começará a perder 1 PV por turno até a morte. O veneno pode ser detido com um teste bem-sucedido de Medicina (Habilidade +1) ou com qualquer magia de cura (que, usada desta forma, neutraliza a toxina mas não restaura PV)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Horror dos Túmulos',
    'Monstro',
    25,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 11, "INT": 2, "WILL": 2, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Contágio Dissolvente", "descricao_habilidade": "Ao acertar um ataque ou caso receba um ataque desarmado (mãos vazias), a criatura deposita uma gosma ácida no alvo. Essa substância dissolve vestimentas e armaduras, reduzindo 1 ponto de Armadura a cada 3 turnos. Quando a Armadura é zerada, passa a infligir 1 ponto de dano por turno na carne da vítima. Se o alvo for reduzido a 0 PV por este efeito, sua carne é totalmente consumida até restar apenas a ossada, transformando-se em um novo Horror dos Túmulos. Livrar-se da gosma exige gastar 1 turno inteiro, sendo o fogo ou danos mágicos os únicos meios eficazes de neutralizá-la."}, {"habilidade": "Forma Hospedeira", "descricao_habilidade": "Ataques físicos convencionais conseguem apenas despedaçar o esqueleto que a criatura habita, impedindo-a de lutar temporariamente. O invertebrado em si só pode ser destruído de forma definitiva se for submetido a fogo ou magias."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ictiossauro',
    'Animal',
    45,
    1,
    '10 M',
    $ATTR${"CON": 44, "FOR": 44, "DEX": 0, "AGI": 11, "INT": 2, "WILL": 2, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Sentidos Aguçados: Sentidos equivalentes aos dos selakos.", "descricao_habilidade": ""}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Incubador',
    'Monstro',
    25,
    2,
    '',
    $ATTR${"CON": 22, "FOR": 11, "DEX": 0, "AGI": 17, "INT": 3, "WILL": 3, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Paralisia: O incubador tenta paralisar a vítima com o veneno dos ferrões.", "descricao_habilidade": ""}, {"habilidade": "Mordida: Dano 1d6 + Contágio.", "descricao_habilidade": ""}, {"habilidade": "Incubação: Usa um ferrão especial na cauda para inserir uma larva no ventre da vítima. A remoção sem matar o hospedeiro exige a magia Desejo.", "descricao_habilidade": ""}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Larva do Incubador',
    'Monstro',
    7,
    1,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 0, "AGI": 11, "INT": 2, "WILL": 2, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Explosão do Peito: Causa 4d6 de dano (sem teste de proteção) ao emergir do hospedeiro.", "descricao_habilidade": ""}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Louva-a-deus da Ruptura',
    'Demônio',
    35,
    4,
    '',
    $ATTR${"CON": 20, "FOR": 21, "DEX": 6, "AGI": 16, "INT": 6, "WILL": 6, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo: Capaz de voar.", "descricao_habilidade": ""}, {"habilidade": "Ataque em Mergulho: Recebe bônus de H+1 em ataques durante um mergulho.", "descricao_habilidade": ""}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homem-formiga da Ruptura',
    'Demônio',
    15,
    3,
    '',
    $ATTR${"CON": 13, "FOR": 15, "DEX": 6, "AGI": 13, "INT": 4, "WILL": 4, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Katrak',
    'Animal',
    2,
    0,
    '',
    $ATTR${"CON": 1, "FOR": 1, "DEX": 0, "AGI": 13, "INT": 1, "WILL": 1, "PER": 14, "CAR": 11}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mimetismo Vocálico: Consegue aprender a pronunciar palavras, frases e canções inteiras.", "descricao_habilidade": ""}, {"habilidade": "Bolsa Ventral: O macho possui uma bolsa elástica capaz de transportar volumes duas vezes maiores que o seu próprio corpo.", "descricao_habilidade": ""}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Kill''bone',
    'Animal',
    25,
    2,
    '',
    $ATTR${"CON": 22, "FOR": 15, "DEX": 2, "AGI": 13, "INT": 2, "WILL": 2, "PER": 24, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque Especial: Pode rolar sobre o inimigo para causar dano com seus espinhos (3d6).", "descricao_habilidade": ""}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Kobold Guarda',
    'Humanoide',
    7,
    2,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 7, "AGI": 10, "INT": 7, "WILL": 7, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Visão no Escuro", "descricao_habilidade": "A criatura é capaz de enxergar perfeitamente na ausência total de luz."}, {"habilidade": "Ataque: Espada Curta", "descricao_habilidade": "Ataque com espada curta. Teste de acerto: 30/30. Dano: 1d6."}, {"habilidade": "Defesa: Escudo", "descricao_habilidade": "Capacidade de bloqueio defensivo utilizando escudo. Valor: 0/30."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Kobold Xamã',
    'Humanoide',
    11,
    2,
    '',
    $ATTR${"CON": 8, "FOR": 10, "DEX": 10, "AGI": 10, "INT": 10, "WILL": 7, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Visão no Escuro", "descricao_habilidade": "A criatura é capaz de enxergar perfeitamente na ausência de luz."}, {"habilidade": "Magia e Milagres", "descricao_habilidade": "Possui 3 Pontos de Magia (PM) e 3 Pontos de Fé (PF). Tem acesso aos caminhos mágicos de Água, Ar, Trevas e Animais."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Kraken',
    'Monstro',
    110,
    6,
    '',
    $ATTR${"CON": 77, "FOR": 77, "DEX": 10, "AGI": 10, "INT": 7, "WILL": 7, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Multi-ataque: Tentáculos", "descricao_habilidade": "A criatura possui múltiplos tentáculos que agem como combatentes separados. Cada tentáculo possui 35 PVs e IP 4. O ataque padrão possui teste 60/20 e causa 2d6+12 de dano."}, {"habilidade": "Multi-ataque: Tentáculos Maiores", "descricao_habilidade": "Possui 2 tentáculos maiores (de 10 a 60 metros) que realizam ataques com teste 50/30, causando 4d6+12 de dano."}, {"habilidade": "Constrição e Arrastar", "descricao_habilidade": "A criatura tenta prender a vítima com um ou mais tentáculos para puxá-la em direção à sua boca (bico) submersa."}, {"habilidade": "Fisiologia dos Tentáculos", "descricao_habilidade": "O dano causado aos tentáculos não reduz os PVs principais do Kraken. Cada tentáculo pode ser inutilizado individualmente ao receber dano igual à sua própria resistência e só pode ser cortado por armas de corte."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Senhor das Profundezas',
    'Demônio',
    250,
    15,
    '',
    $ATTR${"CON": 95, "FOR": 100, "DEX": 15, "AGI": 15, "INT": 45, "WILL": 45, "PER": 45, "CAR": 20}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Tentáculos Abissais", "descricao_habilidade": "Seus tentáculos agem individualmente. Cada um possui 65 PVs e IP 8. Realizam ataques com teste 90/90, causando 3d6+16 de dano."}, {"habilidade": "Tentáculos Abissais Maiores", "descricao_habilidade": "Possui 2 tentáculos colossais principais que realizam ataques com teste 60/60, causando 6d6+16 de dano."}, {"habilidade": "Poderes Telepáticos e Psiônicos", "descricao_habilidade": "A criatura dispõe de uma vasta gama de habilidades psíquicas e telepatia de alcance e efeitos colossais."}, {"habilidade": "Alteração da Realidade", "descricao_habilidade": "Seus desejos e pensamentos tendem a se manifestar fisicamente no mundo real de forma quase instantânea."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Leão-da-guerra',
    'Monstro',
    38,
    3,
    '',
    $ATTR${"CON": 31, "FOR": 31, "DEX": 3, "AGI": 18, "INT": 4, "WILL": 24, "PER": 24, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O leão-da-guerra realiza até três ataques por turno: dois ataques de Garra e um de Mordida."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico. Teste de acerto: 85/70. Dano: 2d6+3."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico. Teste de acerto: 75/20. Dano: 3d6+4."}, {"habilidade": "Rugido Mágico", "descricao_habilidade": "Habilidade natural sem custo de energia que funciona de forma idêntica à magia Pânico, com alcance equivalente ao valor de Resistência da criatura."}, {"habilidade": "Fisiologia Sobrenatural", "descricao_habilidade": "Não respira e nunca necessita de água. Seu sistema digestivo quebra átomos e permite que ele se alimente de qualquer material existente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Lesma-Carnívora',
    'Monstro',
    32,
    0,
    '',
    $ATTR${"CON": 35, "FOR": 15, "DEX": 0, "AGI": 5, "INT": 0, "WILL": 0, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Aroma Atraente", "descricao_habilidade": "A lagoa de muco da lesma exala um odor que viaja por quilômetros. Vítimas que se aproximarem devem passar em um teste de Força de Vontade para evitar serem atraídas irresistivelmente para dentro do muco."}, {"habilidade": "Lagoa de Muco Viscoso", "descricao_habilidade": "O muco dificulta a movimentação. Qualquer criatura lutando no interior da lagoa sofre um redutor de -1 em sua Habilidade (ou equivalente de combate) para ataques."}, {"habilidade": "Disparo de Rádula (Arpão)", "descricao_habilidade": "Dispara um tentáculo espinhoso com alcance de 5 metros. Teste de acerto: 60/0. Dano: 1d6+1."}, {"habilidade": "Arrastar e Engolir", "descricao_habilidade": "Qualquer vítima que sofrer 2 ou mais pontos de dano pelo arpão (após dedução do IP) fica presa, sofrendo 1 ponto de dano contínuo por turno que ignora armaduras. A vítima é arrastada 1 metro por turno em direção à boca, a menos que vença um teste de Força resistido contra a Força da lesma."}, {"habilidade": "Digestão Ácida", "descricao_habilidade": "Uma vez dentro da boca da lesma, a vítima sofre continuamente o dano por ácido de 1d6+2 por rodada."}, {"habilidade": "Espirro Ácido", "descricao_habilidade": "Sempre que a lesma for atacada por armas cortantes, o ácido de seu corpo pode espirrar no atacante, causando 1d3 pontos de dano."}, {"habilidade": "Fisiologia do Tentáculo", "descricao_habilidade": "O tentáculo (arpão) possui 5 PVs próprios. Se sofrer 5 ou mais pontos de dano por corte, ele é amputado sem que isso reduza os PVs principais da lesma. Caso perca o tentáculo ou metade de seus PVs totais, a criatura foge submergindo no muco."}, {"habilidade": "Resistência a Danos Físicos", "descricao_habilidade": "A criatura recebe apenas metade do dano proveniente de ataques físicos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Licantropos Humanóides',
    'Humanoide',
    12,
    0,
    '10 M',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 10, "AGI": 10, "INT": 10, "WILL": 10, "PER": 12, "CAR": 8}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Sentidos Especiais", "descricao_habilidade": "Devido a traços físicos animalescos, costumam possuir visão na penumbra, olfato ou audição aguçados."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Licantropo Bestiais',
    'Monstro / Humanoide',
    15,
    2,
    '13 M',
    $ATTR${"CON": 13, "FOR": 13, "DEX": 10, "AGI": 13, "INT": 10, "WILL": 10, "PER": 12, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Forma Bestial", "descricao_habilidade": "Na forma de fera ganham garras e presas para ataques naturais."}, {"habilidade": "Transformação Involuntária", "descricao_habilidade": "Muda de forma apenas sob condições específicas (como certas fases da lua ou estresse), conforme o gatilho da maldição."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Licantropo Ferais',
    'Monstro',
    15,
    2,
    '13 M',
    $ATTR${"CON": 13, "FOR": 13, "DEX": 10, "AGI": 13, "INT": 6, "WILL": 12, "PER": 14, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Fúria Incontrolável", "descricao_habilidade": "Quando a transformação ocorre, a fera é dominada pela sede de sangue. Não entende linguagens, não reconhece amigos e só retorna à forma humana após cometer um assassinato."}, {"habilidade": "Forma Feral Ferocidade", "descricao_habilidade": "Realiza múltiplos ataques com garras e mordida."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Lich',
    'Morto-Vivo',
    58,
    3,
    '',
    $ATTR${"CON": 28, "FOR": 25, "DEX": 12, "AGI": 15, "INT": 27, "WILL": 27, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques de garras por turno. Teste de acerto: 75/70. Dano: 1d6+5 ou por efeito de Ritual."}, {"habilidade": "Conjurador Lendário", "descricao_habilidade": "Possui 22 Pontos de Magia e 23 Pontos de Focus. Pode conjurar rituais e magias de qualquer caminho, exceto Luz. É capaz de realizar todas as suas magias conhecidas sem consumir seus próprios Pontos de Vida."}, {"habilidade": "Retorno do Amuleto", "descricao_habilidade": "A alma do Lich está selada em um amuleto oculto. Se destruído em combate, o Lich eventualmente retornará à vida, a menos que o amuleto que guarda sua alma também seja completamente destruído."}, {"habilidade": "Proteção Mágica", "descricao_habilidade": "Possui proteção extra de 3D contra qualquer feitiço ou magia direcionada."}, {"habilidade": "Imunidades de Morto-Vivo", "descricao_habilidade": "Possui todas as imunidades naturais inerentes à condição de morto-vivo."}, {"habilidade": "Invulnerabilidade a Armas Comuns", "descricao_habilidade": "Só pode ser ferido ou sofrer dano por meio de magias ou ataques desferidos por armas mágicas de bônus +2 ou superior."}, {"habilidade": "Imunidade Mental e de Estado", "descricao_habilidade": "Totalmente imune a efeitos de Controle de Mortos-Vivos, Esconjuro, Paralisia e magias de Transformação."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Lobo-das-Cavernas',
    'Monstro',
    28,
    1,
    '',
    $ATTR${"CON": 31, "FOR": 30, "DEX": 3, "AGI": 18, "INT": 2, "WILL": 2, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O lobo realiza até três ataques no mesmo turno: duas garras e uma mordida."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico de garras. Teste de acerto: 75/70. Dano: 2d6+3."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico de mordida. Teste de acerto: 70/20. Dano: 3d6."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Mago-Fantasma',
    'Morto-Vivo',
    25,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 14, "WILL": 15, "PER": 10, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque: Toque Drenante", "descricao_habilidade": "Ataque físico de toque. Teste de acerto: 65/70. Dano: 1d3 + efeito especial. O mago-fantasma não causa nenhum outro tipo de dano físico."}, {"habilidade": "Efeito Especial: Drenar Focus", "descricao_habilidade": "Ao ser tocada pelo Mago-Fantasma, a vítima deve realizar um Teste de Resistência. Se falhar, perde permanentemente um ponto de Focus."}, {"habilidade": "Efeito Especial: Drenar Item Mágico", "descricao_habilidade": "Qualquer arma ou item mágico tocado pelo fantasma (ou que o toque) perde suas propriedades mágicas para sempre. No caso de grandes artefatos, o poder é restabelecido após uma semana. Para drenar um item portado por um aventureiro, o espectro precisa apenas ter sucesso em um ataque normal."}, {"habilidade": "Absorção de Magia", "descricao_habilidade": "Qualquer forma de magia lançada diretamente contra o mago-fantasma é totalmente absorvida por ele sem causar nenhum efeito."}, {"habilidade": "Ressurgimento Espectral", "descricao_habilidade": "Quando destruído de forma comum, o mago-fantasma eventualmente ressurge no mesmo local onde morreu."}, {"habilidade": "Vulnerabilidade Inversa", "descricao_habilidade": "Só pode ser atingido e sofrer danos por meio de ataques físicos realizados com armas e projéteis não-mágicos."}, {"habilidade": "Destruição Permanente por Cancelamento de Magia", "descricao_habilidade": "A única forma de destruí-lo permanentemente é utilizando a magia Cancelamento de Magia. Esta magia provoca nele 1 ponto de dano para cada nível de Focus do conjurador. Ele só será banido em definitivo se o golpe final que zerar seus PVs for aplicado por meio deste feitiço."}, {"habilidade": "Imunidade Mágica Total", "descricao_habilidade": "Imune a todas as magias ofensivas, defensivas e de efeito (com exceção de Cancelamento de Magia)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Mantícora',
    'Monstro',
    43,
    3,
    '20 M',
    $ATTR${"CON": 36, "FOR": 35, "DEX": 4, "AGI": 15, "INT": 12, "WILL": 12, "PER": 21, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "A criatura é capaz de voar ativamente com velocidade de 20 metros por segundo."}, {"habilidade": "Ataques Múltiplos", "descricao_habilidade": "A mantícora pode realizar até três ataques no mesmo turno: duas garras e um ataque de ferrão."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico de garras. Teste de acerto: 65/60. Dano: 2d6 + bônus de Força."}, {"habilidade": "Ferrão Venenoso", "descricao_habilidade": "Ataque com o ferrão da cauda. Teste de acerto: 50/0. Dano físico: 1d6. Exige que a vítima faça um Teste de Resistência; em caso de falha, a vítima sofre 3d6 adicionais de dano por veneno, o qual ignora a Armadura."}, {"habilidade": "Suicídio Pragmático", "descricao_habilidade": "Por possuir traços comportamentais de escorpião, a mantícora nunca se deixa capturar viva. Se for encurralada ou impossibilitada de vencer, ela usará o próprio ferrão para se suicidar."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Mantícora Negra',
    'Monstro',
    43,
    3,
    '20 M',
    $ATTR${"CON": 36, "FOR": 35, "DEX": 4, "AGI": 15, "INT": 12, "WILL": 12, "PER": 21, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "A criatura é capaz de voar ativamente com velocidade de 20 metros por segundo."}, {"habilidade": "Ataques Múltiplos", "descricao_habilidade": "Pode realizar até três ataques no mesmo turno: duas garras e um ataque de ferrão."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico de garras. Teste de acerto: 65/60. Dano: 2d6 + bônus de Força."}, {"habilidade": "Ferrão Venenoso", "descricao_habilidade": "Ataque com o ferrão da cauda. Teste de acerto: 50/0. Dano físico: 1d6. Exige que a vítima faça um Teste de Resistência; em caso de falha, a vítima sofre 3d6 adicionais de dano por veneno, o qual ignora a Armadura."}, {"habilidade": "Canto Melodioso e Encantamento", "descricao_habilidade": "A criatura utiliza sua voz melodiosa para encantar inimigos. Qualquer personagem do sexo masculino que escutar sua voz deve realizar um Teste de Resistência ou será forçado a obedecer a quaisquer comandos dados pela mantícora, inclusive ordens que resultem diretamente na própria morte. É exigido um teste individual para cada comando emitido."}, {"habilidade": "Suicídio Pragmático", "descricao_habilidade": "Quando encurralada ou impossibilitada de vencer, a criatura usa o próprio ferrão para se suicidar, impossibilitando sua captura com vida."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Mastim Gigante',
    'Monstro',
    43,
    2,
    '',
    $ATTR${"CON": 33, "FOR": 33, "DEX": 3, "AGI": 10, "INT": 2, "WILL": 6, "PER": 21, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico potente com as mandíbulas. Teste de acerto: 60/20. Dano: 3d6."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Medusa',
    'Monstro',
    18,
    0,
    '',
    $ATTR${"CON": 14, "FOR": 13, "DEX": 14, "AGI": 15, "INT": 14, "WILL": 15, "PER": 15, "CAR": 16}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques de Serpentes", "descricao_habilidade": "As serpentes da cabeleira podem fazer até 4 ataques por turno contra um ou mais alvos no corpo a corpo. Teste de acerto: 40/20. Dano: 1 ponto de dano físico + veneno (exige Teste de Resistência com bônus de +1; falha resulta em 1d6 de dano extra por veneno, que ignora a Armadura)."}, {"habilidade": "Ataque: Arco-e-flecha", "descricao_habilidade": "Ataque à distância com arco. Teste de acerto: 80/0. Dano: 1d10."}, {"habilidade": "Olhar Petrificante", "descricao_habilidade": "Capacidade de transformar criaturas vivas em pedra através de contato visual. Funciona como a magia Petrificação, mas não consome Pontos de Vida da Medusa. A vítima deve realizar um Teste de Resistência com redutor de -1 para evitar o efeito. Para evitar este ataque, o oponente deve lutar de olhos fechados."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Meduzóide',
    'Monstro',
    16,
    0,
    '',
    $ATTR${"CON": 4, "FOR": 8, "DEX": 11, "AGI": 9, "INT": 14, "WILL": 15, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque: Tentáculos", "descricao_habilidade": "Realiza até 4 ataques por rodada utilizando seus tentáculos. Teste de acerto: 30/20. Dano: 1d3."}, {"habilidade": "Poderes Telepáticos", "descricao_habilidade": "Atrai suas vítimas através de telepatia natural."}, {"habilidade": "Habilidades Mentais", "descricao_habilidade": "Capaz de lançar magias mentais e o efeito de Paralisia como habilidades naturais com Focus variáveis."}, {"habilidade": "Invisibilidade Aquática", "descricao_habilidade": "A criatura possui 90% de chance de invisibilidade quando está submersa em água."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Megadásipo',
    'Monstro',
    31,
    6,
    '',
    $ATTR${"CON": 20, "FOR": 18, "DEX": 11, "AGI": 11, "INT": 4, "WILL": 5, "PER": 11, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque: Garras", "descricao_habilidade": "Realiza dois ataques por rodada utilizando suas potentes garras escavadoras. Teste de acerto: 50/30. Dano: 2d6+6."}, {"habilidade": "Rolamento Defensivo", "descricao_habilidade": "Quando muito ferido, o megadásipo se fecha em sua carapaça dura (mantendo IP/Armadura 6) e tenta escapar rolando. Qualquer criatura em seu caminho de fuga deve se esquivar para não ser atropelada, sofrendo 1d6 de dano caso falhe."}, {"habilidade": "Sentidos não-visuais", "descricao_habilidade": "Praticamente cego, o megadásipo guia-se inteiramente por vibrações, sons e odores. Por este motivo, é imune a magias e efeitos que dependam de visão, escuridão ou ilusões ópticas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Besouro-gigante',
    'Monstro',
    75,
    7,
    '',
    $ATTR${"CON": 60, "FOR": 58, "DEX": 0, "AGI": 9, "INT": 0, "WILL": 0, "PER": 6, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "Pode realizar até dois ataques de garras ou um único ataque de jato de ácido por rodada."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico de garras colossais. Teste de acerto: 60/30. Dano: 4d6+6."}, {"habilidade": "Jato de Ácido", "descricao_habilidade": "Dispara um jato corrosivo devastador contra seus alvos. Dano: 6d6+6. Limitação: Pode ser utilizado no máximo 3 vezes ao dia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Besouro-Megalonte',
    'Monstro',
    75,
    7,
    '',
    $ATTR${"CON": 60, "FOR": 58, "DEX": 0, "AGI": 9, "INT": 0, "WILL": 0, "PER": 6, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "Pode realizar até dois ataques de garras ou um único ataque de jato de ácido por rodada."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico de garras colossais. Teste de acerto: 60/30. Dano: 4d6+6."}, {"habilidade": "Jato de Ácido", "descricao_habilidade": "Dispara um jato corrosivo devastador contra seus alvos. Dano: 6d6+6. Limitação: Pode ser utilizado no máximo 3 vezes ao dia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Sapo-Gigante Titânico',
    'Monstro',
    75,
    5,
    '250 M',
    $ATTR${"CON": 60, "FOR": 58, "DEX": 0, "AGI": 9, "INT": 3, "WILL": 3, "PER": 12, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida e Digestão Ácida", "descricao_habilidade": "Ataque físico de mordida. Teste de acerto: 60/0. Dano inicial: 2d6+3. Adicionalmente, as presas presas em sua bocarra sofrem 2d6 de dano por ácido de seu suco gástrico a cada rodada subsequente."}, {"habilidade": "Captura com a Língua", "descricao_habilidade": "Projeta sua língua massiva para capturar criaturas a uma distância de até 100 metros."}, {"habilidade": "Super Salto", "descricao_habilidade": "Capacidade de locomoção ativa que permite saltar distâncias de até 250 metros de uma única vez."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Meio-Dragão',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Herança Dracônica", "descricao_habilidade": "O meio-dragão possui capacidades físicas e mentais muito acima da média, recebendo um bônus de +1 em todas as suas Características (atributos) até um máximo de 5."}, {"habilidade": "Invulnerabilidade Dracônica", "descricao_habilidade": "O meio-dragão herda imunidade total a um tipo específico de energia ou elemento ligado à linhagem de seu pai dragão, devendo escolher apenas uma entre as seguintes opções: Calor/Fogo, Frio/Gelo, Luz, Eletricidade, Som/Vento, Trevas ou Químico."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Minotauro',
    'Humanoide',
    20,
    0,
    '',
    $ATTR${"CON": 20, "FOR": 20, "DEX": 13, "AGI": 14, "INT": 12, "WILL": 13, "PER": 12, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque por Arma", "descricao_habilidade": "O minotauro realiza ataques utilizando armas convencionais de combate. O teste de acerto e o dano dependem inteiramente do tipo de arma equipada."}, {"habilidade": "Orientação Labiríntica", "descricao_habilidade": "Minotauros possuem a capacidade natural de memorizar perfeitamente qualquer trajeto realizado no interior de túneis, masmorras, corredores ou catacumbas, sendo totalmente incapazes de se perder nestes ambientes. Esta habilidade não funciona em florestas ou pântanos."}, {"habilidade": "Acrofobia", "descricao_habilidade": "Minotauros possuem um medo instintivo de altura. Estar exposto a qualquer altura superior a 3 metros exige um Teste de Resistência com bônus de +2; caso falhe, o minotauro sofre o efeito idêntico ao da magia Pânico."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Monstro da Ferrugem',
    'Monstro',
    6,
    0,
    '',
    $ATTR${"CON": 4, "FOR": 4, "DEX": 4, "AGI": 9, "INT": 1, "WILL": 2, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Toque de Ferrugem", "descricao_habilidade": "O monstro pode realizar dois ataques de antenas por rodada. Esses golpes não causam dano a seres vivos, mas oxidam instantaneamente qualquer metal. Um acerto bem-sucedido reduz 1 ponto de Força (-10% para armas ou escudos) ou -1 IP em Armaduras metálicas."}, {"habilidade": "Degradação de Itens Mágicos", "descricao_habilidade": "Peças mágicas ou Armas Especiais atacadas pelo monstro têm 1 chance em 1d6 de resistir. Em caso de falha, perdem permanentemente suas propriedades místicas e tornam-se itens comuns. Um segundo ataque destrói o item por completo (não se aplica a artefatos e itens de poder equivalente)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Moréia',
    'Animal',
    8,
    0,
    '',
    $ATTR${"CON": 8, "FOR": 4, "DEX": 0, "AGI": 11, "INT": 1, "WILL": 2, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida Presa e Veneno", "descricao_habilidade": "Ataque de mordida (teste 50/0, dano 1d6). Ao morder, a criatura trava suas mandíbulas, fazendo com que o veneno escorra para a ferida, causando 2 pontos de dano adicionais por turno (ignora Armadura/IP) até que se solte. Para arrancar a moréia, é necessário passar em um Teste de Força + 1."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Moréia-Titã',
    'Animal',
    8,
    0,
    '',
    $ATTR${"CON": 18, "FOR": 14, "DEX": 0, "AGI": 11, "INT": 1, "WILL": 2, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida Presa e Veneno Potente", "descricao_habilidade": "Ataque de mordida (teste 50/0, dano 2d6). Ao morder, a criatura trava suas mandíbulas, aplicando um veneno que causa 4 pontos de dano adicionais por turno (ignora Armadura/IP) até que se solte. Para desvencilhar a criatura, é necessário passar em um Teste de Força + 1."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Múmia',
    'Morto-Vivo',
    33,
    0,
    '',
    $ATTR${"CON": 23, "FOR": 24, "DEX": 11, "AGI": 8, "INT": 12, "WILL": 18, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras Pestilentas", "descricao_habilidade": "Realiza até 2 ataques de garras por turno (dano 1d6 + bônus de Força). Acertos exigem um Teste de Resistência da vítima; em caso de falha, contrai uma doença sobrenatural (maldição) que impõe um redutor de -1 em todos os testes (-3 em Atributos Físicos). Afeta apenas seres vivos."}, {"habilidade": "Aura de Medo", "descricao_habilidade": "Algumas múmias podem exalar uma aura mística que conjura a magia Pânico (alcance igual à sua Resistência) como habilidade natural, sem custo de pontos."}, {"habilidade": "Disfarce Ilusório", "descricao_habilidade": "Pode assumir uma ilusão para se passar por um ser humano comum. O disfarce é dissipado imediatamente se a múmia sofrer dano ou entrar em combate."}, {"habilidade": "Prisão à Tumba", "descricao_habilidade": "A múmia é vinculada à sua tumba por sua maldição. Ao se afastar mais de 100m (ou mais, dependendo de sua idade), começa a se deteriorar e perde 1 PV por turno a cada nascer do sol até retornar ou ser destruída."}, {"habilidade": "Vulnerabilidade ao Fogo", "descricao_habilidade": "Sofre dano normal por fogo, contornando suas imunidades."}, {"habilidade": "Imunidades de Morto-Vivo", "descricao_habilidade": "Possui as imunidades padrões aplicadas a criaturas mortas-vivas."}, {"habilidade": "Invulnerabilidade Seletiva", "descricao_habilidade": "Imune a todas as formas de dano físico comum, podendo ser ferida apenas por fogo, magia e armas mágicas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Naga',
    'Monstro',
    26,
    1,
    '',
    $ATTR${"CON": 19, "FOR": 17, "DEX": 14, "AGI": 13, "INT": 10, "WILL": 15, "PER": 15, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques de Garras", "descricao_habilidade": "Pode realizar até 2 ataques de garras por turno, causando 1d6 + bônus de Força em caso de acerto."}, {"habilidade": "Ataque Constritor", "descricao_habilidade": "Realiza um ataque inicial de constrição. Se for bem-sucedida, prende a vítima e passa a esmagá-la automaticamente, causando 1d6 + 3 de dano por rodada (ignora Armadura/IP). Uma vítima presa só pode atacar se passar em um Teste de Força, limitada ao uso de armas pequenas (dano máximo 1d6). Ataques de aliados contra a Naga que a prendeu exigem um Teste de Habilidade - 1; em caso de falha, causam metade do dano à própria vítima presa."}, {"habilidade": "Máscara Ilusória", "descricao_habilidade": "Pode assumir a aparência de uma mulher humana. Mantém suas características físicas padrão, mas perde a capacidade de realizar ataques constritores enquanto estiver sob este disfarce."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Neblina-Fantasma',
    'Espírito',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Toque de Energia", "descricao_habilidade": "Pode realizar 2 ataques de toque por turno. Os ataques ignoram Armadura/IP e causam 1d6 pontos de dano espiritual."}, {"habilidade": "Devorar Alma", "descricao_habilidade": "Se a neblina reduzir uma vítima viva (ou morta-viva) a 0 PV, ela consome inteiramente sua alma na rodada seguinte. A vítima não poderá ser ressuscitada por métodos convencionais, exigindo a conjuração de um Desejo. Construtos são imunes a este efeito."}, {"habilidade": "Vulnerabilidade ao Combate Comum", "descricao_habilidade": "Incomumente, sofre danos apenas de armas e ataques completamente mundanos e não mágicos."}, {"habilidade": "Imunidade a Magia e Armas Mágicas", "descricao_habilidade": "É totalmente imune a qualquer tipo de feitiço, magia ou arma mágica (incluindo Armas Especiais)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Neblina-Vampírica',
    'Monstro',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 14, "WILL": 0, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Corrosão", "descricao_habilidade": "Ataque corrosivo (teste 90/0) que causa 1d6 pontos de dano por rodada a quem estiver envolvido pelas brumas, dissolvendo a vítima e todos os seus pertences. Alvos no interior da névoa podem realizar um Teste de Resistência por rodada para reduzir esse dano pela metade."}, {"habilidade": "Movimento Autônomo", "descricao_habilidade": "A criatura é capaz de se deslocar ativamente na velocidade de uma pessoa caminhando, ignorando a direção das brisas naturais para perseguir e envolver seus alvos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão-Esqueleto',
    'Morto-Vivo',
    42,
    7,
    '',
    $ATTR${"CON": 40, "FOR": 44, "DEX": 10, "AGI": 17, "INT": 0, "WILL": 0, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão realiza até três ataques por turno: duas garras (teste 75/70, dano 2d10+6) e uma mordida (teste 75/0, dano 2d6+3)."}, {"habilidade": "Bafo de Gelo", "descricao_habilidade": "Arma de sopro utilizável de 2 a 5 vezes ao dia, que projeta um jato de ar congelante causando 6d6+6 pontos de dano por frio."}, {"habilidade": "Sentidos Especiais", "descricao_habilidade": "Conserva os sentidos especiais que possuía quando vivo."}, {"habilidade": "Arena", "descricao_habilidade": "Conserva a habilidade Arena que possuía quando vivo."}, {"habilidade": "Dano Permanente", "descricao_habilidade": "Não pode recuperar Pontos de Vida de forma comum. Uma vez danificado, seus ferimentos são permanentes, a menos que sejam utilizadas magias específicas de restauração de mortos-vivos."}, {"habilidade": "Inabilidade de Voo", "descricao_habilidade": "Incapaz de voar devido à ausência de couro em suas asas."}, {"habilidade": "Resistência a Frio", "descricao_habilidade": "Possui resistência de 3d6 contra magias baseadas em frio."}, {"habilidade": "Armadura Extra", "descricao_habilidade": "Recebe apenas metade do dano de ataques causados por armas de corte e perfuração (como lanças, flechas e outros objetos semelhantes)."}, {"habilidade": "Inabilidade de Cura", "descricao_habilidade": "Não pode ser curado com magias, poções ou itens mágicos de cura tradicionais (que causam dano em vez de curar)."}, {"habilidade": "Imunidades de Morto-Vivo", "descricao_habilidade": "Imune a venenos, doenças, magias ou poderes que afetam a mente, e a quaisquer efeitos que funcionem exclusivamente contra criaturas vivas."}, {"habilidade": "Imunidade Absoluta a Frio", "descricao_habilidade": "Não pode ser afetado por ataques baseados em frio ou gelo, sejam eles naturais ou mágicos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão-Zumbi',
    'Morto-Vivo',
    52,
    8,
    '',
    $ATTR${"CON": 40, "FOR": 44, "DEX": 10, "AGI": 17, "INT": 2, "WILL": 0, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão realiza até três ataques por turno: duas garras (teste 70/70, dano 2d10+8) e uma mordida (teste 80/0, dano 2d6+3)."}, {"habilidade": "Bafo de Gelo", "descricao_habilidade": "Arma de sopro utilizável de 2 a 5 vezes ao dia, que projeta um jato de ar congelante causando 7d6+6 pontos de dano por frio."}, {"habilidade": "Voo", "descricao_habilidade": "Apesar de rasgadas, suas asas ainda funcionam, permitindo que a criatura voe."}, {"habilidade": "Sentidos Especiais", "descricao_habilidade": "Conserva os sentidos especiais que possuía quando vivo."}, {"habilidade": "Arena", "descricao_habilidade": "Conserva a habilidade Arena que possuía quando vivo."}, {"habilidade": "Resistência a Frio", "descricao_habilidade": "Possui resistência de 3d6 contra magias baseadas em frio."}, {"habilidade": "Resistência Física", "descricao_habilidade": "Recebe apenas metade do dano de ataques causados por lanças, flechas e outros objetos perfurantes."}, {"habilidade": "Inabilidade de Cura", "descricao_habilidade": "Não pode ser curado com magias, poções ou itens mágicos de cura tradicionais (que causam dano em vez de curar)."}, {"habilidade": "Imunidades de Morto-Vivo", "descricao_habilidade": "Imune a venenos, doenças, magias ou poderes que afetam a mente, e a quaisquer efeitos que funcionem exclusivamente contra criaturas vivas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Dragão-Lich',
    'Morto-Vivo',
    55,
    8,
    '',
    $ATTR${"CON": 49, "FOR": 52, "DEX": 15, "AGI": 17, "INT": 31, "WILL": 31, "PER": 31, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "O dragão realiza até três ataques por turno: duas garras (teste 90/75, dano 2d10+11) e uma mordida (teste 90/0, dano 2d6+6)."}, {"habilidade": "Bafo de Gelo", "descricao_habilidade": "Arma de sopro utilizável de 3 a 8 vezes ao dia, que projeta um jato de ar congelante causando 8d6+8 pontos de dano por frio."}, {"habilidade": "Voo Mágico", "descricao_habilidade": "Suas asas, mesmo sem couro, levitam o dragão magicamente, permitindo que voe."}, {"habilidade": "Poder Mágico Supremo", "descricao_habilidade": "Possui Focus 11-13 em Trevas e 9-11 em todos os outros Caminhos. É capaz de realizar duas magias por rodada sem consumir Pontos de Vida ou Pontos de Magia."}, {"habilidade": "Resistência Mecânica a Perfuração", "descricao_habilidade": "Recebe apenas metade do dano de ataques causados por lanças, flechas e outros objetos perfurantes."}, {"habilidade": "Resistência Mágica Geral", "descricao_habilidade": "Possui resistência de 4d6 contra magias em geral."}, {"habilidade": "Inabilidade de Cura", "descricao_habilidade": "Não pode ser curado com magias, poções ou itens mágicos de cura tradicionais (que causam dano em vez de curar)."}, {"habilidade": "Imunidades de Morto-Vivo", "descricao_habilidade": "Imune a venenos, doenças, magias ou poderes que afetam a mente, e a quaisquer efeitos que funcionem exclusivamente contra criaturas vivas."}, {"habilidade": "Invulnerabilidade a Armas Mundanas", "descricao_habilidade": "Totalmente invulnerável a ataques de armas que não sejam mágicas."}, {"habilidade": "Imunidades de Lich", "descricao_habilidade": "Totalmente imune a Esconjuro de Mortos-Vivos, Paralisia e Transformação."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Nereida Abissal',
    'Monstro',
    25,
    4,
    '',
    $ATTR${"CON": 14, "FOR": 10, "DEX": 12, "AGI": 17, "INT": 14, "WILL": 14, "PER": 14, "CAR": 17}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico básico corpo a corpo realizado com as barbatanas das mãos (teste 50/25), causando 1d6 de dano em caso de acerto."}, {"habilidade": "Controle de Água", "descricao_habilidade": "Capacidade mágica ativa de controlar porções de água em um alcance de até 10 metros."}, {"habilidade": "Invocação da Serpente de Água", "descricao_habilidade": "Invoca uma serpente constituída inteiramente de água capaz de envolver e afogar um oponente. A serpente ressurgirá 2 turnos após ser eliminada e só pode ser destruída por magia com Focus 2 ou superior em Água."}, {"habilidade": "Sensibilidade Vibratória", "descricao_habilidade": "Sendo cega, percebe perfeitamente o ambiente à sua volta por meio de ondulações e vibrações na água."}, {"habilidade": "Invisibilidade Aquática", "descricao_habilidade": "A criatura é quase completamente invisível enquanto estiver submersa em água."}, {"habilidade": "Cegueira", "descricao_habilidade": "A criatura é cega para a visão comum, dependendo de sua sensibilidade vibratória na água."}, {"habilidade": "Resistência a Cortes e Perfurações", "descricao_habilidade": "Sofre apenas metade do dano oriundo de ataques por corte e perfuração."}, {"habilidade": "Vulnerabilidade Seletiva", "descricao_habilidade": "Só pode ser ferida de forma efetiva por magia ou armas mágicas."}, {"habilidade": "Imunidade a Contusão", "descricao_habilidade": "Seu corpo adaptado às pressões abissais é completamente imune a qualquer tipo de dano por contusão."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ninfa',
    'Espírito',
    15,
    0,
    '',
    $ATTR${"CON": 12, "FOR": 9, "DEX": 12, "AGI": 16, "INT": 14, "WILL": 14, "PER": 14, "CAR": 22}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Invisibilidade e Teleporte de Fuga", "descricao_habilidade": "Poderes ativados instantaneamente apenas para fins de evasão quando a criatura se sente ameaçada ou encurralada."}, {"habilidade": "Beijo Purificador", "descricao_habilidade": "O beijo da ninfa acorda alvos inconscientes sob efeito de Coma, cura a maior parte das maldições e cancela determinadas magias de Transformação."}, {"habilidade": "Beleza Absoluta (Voz e Presença)", "descricao_habilidade": "É impossível para qualquer animal selvagem ou humanoide masculino atacá-la após vê-la ou ouvir sua voz melodiosa. Personagens femininos que tentem agredi-la de qualquer forma devem passar em um Teste de Força de Vontade a cada tentativa de ataque."}, {"habilidade": "Atordoamento de Nudez", "descricao_habilidade": "A visão de uma ninfa despida exige de humanoides masculinos um Teste de Força de Vontade. Uma falha drena os Pontos de Vida do alvo para 0, deixando-o inconsciente e em estado de congelamento (idêntico à magia Coma). A vítima acorda apenas com a magia Desejo ou com o beijo da ninfa."}, {"habilidade": "Totalmente Pacífica", "descricao_habilidade": "Incapaz de lutar, usar armas ou realizar ataques de qualquer tipo, mesmo para defender a própria vida; prefere aceitar a morte se não puder fugir."}, {"habilidade": "Vínculo Ambiental", "descricao_habilidade": "Não sobrevive longe de locais de grande beleza natural. Se for removida de seu ecossistema, começará a definhar, morrendo inevitavelmente após 1 hora."}, {"habilidade": "Aversão a Armas e Feiura", "descricao_habilidade": "Recusa-se a conversar com qualquer um vestindo armaduras ou portando armas, e foge imediatamente diante de personagens monstruosos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Observador',
    'Monstro',
    22,
    4,
    '',
    $ATTR${"CON": 15, "FOR": 5, "DEX": 0, "AGI": 15, "INT": 15, "WILL": 12, "PER": 17, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida de Mandíbula", "descricao_habilidade": "Ataque físico corpo a corpo realizado com sua terrível bocarra (teste 60/0), causando 3d6 de dano."}, {"habilidade": "Raio Central de Anti-Magia", "descricao_habilidade": "O grande olho central projeta constantemente um raio de anti-magia (com 3d6 de Força) que atinge toda a área à sua frente, anulando qualquer feitiço lançado contra o Observador ou itens mágicos ativos na área."}, {"habilidade": "Raios dos Olhos Menores", "descricao_habilidade": "A criatura possui em média 9 olhos menores (variando de 4 a 14). Cada um destes olhos possui 5 pontos de Focus em um Caminho de Magia específico e pode realizar um Ritual predeterminado pelo mestre."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ogro Soldado',
    'Humanoide',
    22,
    2,
    '',
    $ATTR${"CON": 20, "FOR": 17, "DEX": 12, "AGI": 11, "INT": 6, "WILL": 6, "PER": 10, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Espada Longa", "descricao_habilidade": "Ataque corpo a corpo realizado com uma espada longa (teste 40/30), causando 1d10+2 de dano."}, {"habilidade": "Má Fama", "descricao_habilidade": "Ogres são sempre temidos e tratados com extrema desconfiança em toda terra dos minotauros."}, {"habilidade": "Inculto", "descricao_habilidade": "Criaturas primitivas que não possuem conhecimentos sofisticados de agricultura, artesanato ou escrita."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ogro Capitão',
    'Humanoide',
    35,
    4,
    '',
    $ATTR${"CON": 21, "FOR": 20, "DEX": 12, "AGI": 11, "INT": 11, "WILL": 6, "PER": 10, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Espada Longa", "descricao_habilidade": "Ataque corpo a corpo realizado com uma espada longa (teste 55/50), causando 1d10+5 de dano."}, {"habilidade": "Má Fama", "descricao_habilidade": "Ogres são sempre temidos e tratados com extrema desconfiança em toda terra dos minotauros."}, {"habilidade": "Inculto", "descricao_habilidade": "Apesar de ser mais inteligente que seus subordinados, o capitão ainda carece de educação formal ou conhecimentos artesanais complexos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Orc',
    'Humanoide',
    9,
    2,
    '',
    $ATTR${"CON": 11, "FOR": 13, "DEX": 10, "AGI": 11, "INT": 6, "WILL": 6, "PER": 10, "CAR": 6}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Espada Longa", "descricao_habilidade": "Ataque corporal com espada longa (teste 40/30) que causa 1d6 pontos de dano."}, {"habilidade": "Infravisão", "descricao_habilidade": "Capacidade de enxergar perfeitamente no escuro devido aos seus hábitos subterrâneos."}, {"habilidade": "Talento de Ofício", "descricao_habilidade": "Excelentes talentos naturais como mineradores e ferreiros."}, {"habilidade": "Analfabetismo", "descricao_habilidade": "Embora possuam linguagem própria falada, os orcs não conhecem a escrita."}, {"habilidade": "Covardia por Intimidação", "descricao_habilidade": "Costumam temer qualquer criatura maior e mais forte que eles, sendo motivados a lutar principalmente através da intimidação de seus líderes."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Pantera-do-Vidro',
    'Animal',
    35,
    4,
    '',
    $ATTR${"CON": 30, "FOR": 30, "DEX": 3, "AGI": 20, "INT": 3, "WILL": 6, "PER": 21, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "A pantera pode realizar até três ataques por turno: duas garras (teste 70/60, dano 2d6+2) e uma mordida (teste 75/0, dano 2d6+6)."}, {"habilidade": "Garras e Presas Perfurantes", "descricao_habilidade": "Devido à absorção de minerais metálicos das rochas, seus ataques ignoram a jogada normal de armadura do alvo, que recebe automaticamente o resultado mínimo em sua jogada de Armadura (como se tivesse Vulnerabilidade). Esta propriedade é ignorada apenas se o alvo possuir Armadura Extra contra corte."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Pássaro Arco-Íris',
    'Animal',
    1,
    0,
    '',
    $ATTR${"CON": 2, "FOR": 2, "DEX": 3, "AGI": 13, "INT": 2, "WILL": 2, "PER": 18, "CAR": 15}$ATTR$::jsonb,
    $ABIL$[]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Pégaso',
    'Espírito',
    66,
    2,
    '',
    $ATTR${"CON": 36, "FOR": 26, "DEX": 18, "AGI": 16, "INT": 16, "WILL": 16, "PER": 20, "CAR": 18}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques de Cascos", "descricao_habilidade": "O Pégaso pode desferir dois ataques por rodada usando seus cascos (teste 95/90), causando 2d6+5 pontos de dano."}, {"habilidade": "Ataque de Mordida", "descricao_habilidade": "Ataque corporal secundário com sua mordida (teste 90/20), causando 1d10 pontos de dano."}, {"habilidade": "Coice", "descricao_habilidade": "Ataque violento com as patas traseiras (teste 80/0), causando 3d6 pontos de dano."}, {"habilidade": "Ataque Múltiplo", "descricao_habilidade": "Permite realizar ataques adicionais com alta precisão devido à sua excelente agilidade combativa."}, {"habilidade": "Voo Infatigável", "descricao_habilidade": "Capacidade ativa de voar a velocidades superiores às de um grifo, conseguindo manter o voo em velocidade máxima sem jamais sofrer cansaço."}, {"habilidade": "Transformação Humana", "descricao_habilidade": "Pode se transformar em um elegante guerreiro humano vestindo uma armadura prateada, mantendo a capacidade de falar em ambas as formas."}, {"habilidade": "Ressurreição Divina", "descricao_habilidade": "Caso seja destruído, o Pégaso será recriado pelo poder de seu deus, ressuscitando perfeitamente após 1d6 dias."}, {"habilidade": "Inimigo Mortal", "descricao_habilidade": "Possui rivalidade extrema e ódio pelo Hipogrifo, a montaria do deus do Caos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Peixe-Couraça',
    'Animal',
    33,
    2,
    '',
    $ATTR${"CON": 30, "FOR": 23, "DEX": 0, "AGI": 12, "INT": 2, "WILL": 1, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Pancada de Cabeça", "descricao_habilidade": "Ataque físico de impacto utilizando sua cabeça blindada (teste 60/0), causando 2d6+3 pontos de dano."}, {"habilidade": "Cabeça Blindada", "descricao_habilidade": "Sua cabeça possui placas que concedem IP 4 contra ataques direcionados à sua parte frontal."}, {"habilidade": "Corpo Desprotegido", "descricao_habilidade": "As demais partes do corpo da criatura não possuem armadura (IP 0)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Peixe-Gancho',
    'Animal',
    86,
    2,
    '',
    $ATTR${"CON": 33, "FOR": 23, "DEX": 0, "AGI": 8, "INT": 1, "WILL": 1, "PER": 12, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Arpão da Nadadeira", "descricao_habilidade": "Ataque com o primeiro raio articulado de sua nadadeira dorsal (teste 75/0), causando 1d3 de dano. Se causar dano, a vítima deve vencer uma disputa de Força contra o peixe para não ser arrastada e submersa."}, {"habilidade": "Abocanhar Presa", "descricao_habilidade": "Uma vez que o alvo está preso no gancho de sua nadadeira, o peixe realiza ataques automáticos de mordida (teste 30/20 ou automático se submerso), causando 1d3+1 de dano por rodada com bônus de Força."}, {"habilidade": "Sensibilidade à Luz", "descricao_habilidade": "O peixe é extremamente sensível à luz solar direta, evitando a superfície durante o dia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Peixe-Recife',
    'Monstro',
    200,
    12,
    '',
    $ATTR${"CON": 110, "FOR": 110, "DEX": 0, "AGI": 5, "INT": 1, "WILL": 1, "PER": 12, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Planador',
    'Humanoide',
    23,
    1,
    '5 M',
    $ATTR${"CON": 14, "FOR": 14, "DEX": 15, "AGI": 14, "INT": 8, "WILL": 8, "PER": 16, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corpo a corpo utilizando as garras de seus membros. Causa 1d6+1 de dano."}, {"habilidade": "Planar", "descricao_habilidade": "As asas membranosas da criatura permitem amortecer quedas e planar no ar com deslocamento de 5 m/s. Exige que a criatura ganhe altura escalando previamente."}, {"habilidade": "Escalada Ágil", "descricao_habilidade": "O planador consegue escalar superfícies verticais, especialmente árvores, com extrema agilidade e velocidade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homem-Sapo Guerreiro',
    'Humanoide',
    9,
    2,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 10, "AGI": 10, "INT": 7, "WILL": 7, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Espreitar nas Árvores", "descricao_habilidade": "Ganha bônus de combate (+2 na Habilidade) quando está posicionado em cima de árvores, de onde costuma arremessar lanças."}, {"habilidade": "Ataque com Adaga", "descricao_habilidade": "Ataque corpo a corpo com adaga (30/30), causando 1d3 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Homem-Sapo Capitão',
    'Humanoide',
    15,
    2,
    '',
    $ATTR${"CON": 14, "FOR": 14, "DEX": 10, "AGI": 10, "INT": 10, "WILL": 7, "PER": 10, "CAR": 5}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Espreitar nas Árvores", "descricao_habilidade": "Ganha bônus de combate (+2 na Habilidade) quando está posicionado em cima de árvores, de onde costuma arremessar lanças."}, {"habilidade": "Ataque com Adaga", "descricao_habilidade": "Ataque corpo a corpo com adaga (40/40), causando 1d3 + bônus de dano."}, {"habilidade": "Ataque com Lança Curta", "descricao_habilidade": "Ataque corpo a corpo ou à distância com lança curta (30/30), causando 1d6 + bônus de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Rã-Serpente',
    'Monstro',
    22,
    0,
    '',
    $ATTR${"CON": 17, "FOR": 12, "DEX": 0, "AGI": 7, "INT": 4, "WILL": 4, "PER": 7, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Toque Venenoso", "descricao_habilidade": "O mero toque na pele ou sangue da rã é perigoso. Qualquer ataque bem-sucedido contra ela em combate corpo a corpo exige que o atacante faça um Teste de Resistência; falha resulta em 1d6 pontos de dano que ignoram a Armadura do alvo."}, {"habilidade": "Ataque de Língua", "descricao_habilidade": "Ataque de língua (50/0) que causa 1 ponto de dano físico e injeta um veneno poderoso através de um espinho na ponta. A vítima deve realizar um Teste de Resistência: falha causa morte automática; sucesso resulta na perda de 1 PV por turno até a morte (curável apenas com a magia Cura Total)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Sapo-Gigante',
    'Monstro',
    27,
    1,
    '',
    $ATTR${"CON": 17, "FOR": 20, "DEX": 2, "AGI": 7, "INT": 4, "WILL": 4, "PER": 7, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Abocanhar com a Língua", "descricao_habilidade": "Ataque de língua (65/0). Não causa dano inicial, mas, se acertar, arrasta a vítima para dentro de sua boca."}, {"habilidade": "Deglutir", "descricao_habilidade": "Uma vítima presa dentro da boca do Sapo-Gigante sofre 3d6 pontos de dano por turno até morrer ou se libertar. Para escapar, a vítima deve passar em um Teste resistido de Força contra a Força do Sapo-Gigante (FOR 20)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Catoblepas',
    'Monstro',
    35,
    2,
    '',
    $ATTR${"CON": 24, "FOR": 21, "DEX": 0, "AGI": 8, "INT": 6, "WILL": 6, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Regeneração Divina", "descricao_habilidade": "Se for derrotado, o Catoblepas regenera e volta à vida em poucos dias."}, {"habilidade": "Raio de Transformação", "descricao_habilidade": "Dispara um raio pelos olhos capaz de transformar a vítima em um homem-sapo. O efeito funciona como uma Magia de Transformação e exige um Teste de Resistência da vítima para ser negado. Alvos com Força de Vontade (WILL) igual ou superior a 16 são totalmente imunes."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Predador dos Sonhos',
    'Demônio',
    15,
    0,
    '10 M',
    $ATTR${"CON": 15, "FOR": 12, "DEX": 12, "AGI": 12, "INT": 14, "WILL": 16, "PER": 15, "CAR": 4}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Invasão Onírica e Posse", "descricao_habilidade": "Inicia o contato a menos de 10m de uma vítima que esteja dormindo de dia. Trava combates noite após noite no Mundo dos Sonhos. A cada vitória do predador, ele controla o corpo da vítima na noite seguinte (sem memória para a vítima) e exige um teste de Vontade/Resistência do alvo (-1 cumulativo a cada 3 vitórias do predador). Em caso de falha, a alma da vítima morre e o predador assume o corpo em definitivo. Se a vítima resistir por 10 dias, o predador desiste."}, {"habilidade": "Degeneração e Mutação do Hospedeiro", "descricao_habilidade": "Em um corpo possuído, assume seus atributos e vantagens. A cada 30 dias, sua FOR e AGI/DEX aumentam em +1, mas sua CON reduz em -1. Se CON chegar a 0, ele busca outro corpo. Se ficar sem corpo, morre até que alguém durma a menos de 10m de sua carcaça."}, {"habilidade": "Morte Diurna e Regeneração Noturna", "descricao_habilidade": "O corpo físico realmente morre e entra em putrefação durante o dia. Ao pôr-do-sol, ressuscita totalmente restaurado. Se despedaçado, a maior parte do cérebro regenera o corpo inteiro em 1 semana."}, {"habilidade": "Fome de Corações", "descricao_habilidade": "Sente necessidade insaciável de devorar corações. Perde 2 PVs para cada semana sem ingerir tecido cardíaco. Corações humanos restauram 2 PVs; corações de animais restauram 1 PV."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Predador-Toupeira',
    'Monstro',
    31,
    2,
    '5 M',
    $ATTR${"CON": 24, "FOR": 21, "DEX": 11, "AGI": 14, "INT": 3, "WILL": 8, "PER": 15, "CAR": 9}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Escavar", "descricao_habilidade": "Capaz de escavar terra ou rocha sólida a uma velocidade de 2,5 m/s devido à sua imensa força."}, {"habilidade": "Visão nas Trevas", "descricao_habilidade": "Olhos grandes e extremamente sensíveis que permitem enxergar perfeitamente na escuridão completa."}, {"habilidade": "Ataque de Garras", "descricao_habilidade": "Realiza até dois ataques de garras (45/40), causando 1d6+3 de dano cada."}, {"habilidade": "Ataque de Tentáculos", "descricao_habilidade": "Realiza até dois ataques com seus tentáculos espinhosos (60/20) com alcance de até 10 metros, causando 1d10 de dano cada."}, {"habilidade": "Constrição de Tentáculos", "descricao_habilidade": "Ao acertar um ataque de tentáculo, a vítima deve passar em um Teste de Força. Se falhar, fica presa, impedida de lutar, e sofre 1d6 de dano por turno até passar em um novo Teste de Força para se libertar."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Protodraco',
    'Monstro',
    18,
    1,
    '',
    $ATTR${"CON": 14, "FOR": 11, "DEX": 7, "AGI": 14, "INT": 3, "WILL": 3, "PER": 15, "CAR": 8}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar utilizando suas asas em formato de leque."}, {"habilidade": "Ataques Múltiplos Físicos", "descricao_habilidade": "Se não utilizar o seu ataque de Relâmpago, o protodraco pode realizar três ataques no mesmo turno: duas garras (55/40, dano 1d6+1) e uma mordida (50/30, dano 1d6)."}, {"habilidade": "Descarga de Relâmpago", "descricao_habilidade": "Dispara um relâmpago biológico através da cauda com alcance de 10 metros, causando 1d6+6 de dano. A vítima deve passar em um Teste de Resistência ou ficará paralisada por cerca de 10 minutos. Esta habilidade tem uma recarga de 6 horas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Pteranodonte',
    'Monstro',
    14,
    0,
    '5 M',
    $ATTR${"CON": 11, "FOR": 11, "DEX": 3, "AGI": 13, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar e planar sobre a água a uma velocidade de 5 m/s."}, {"habilidade": "Ataque de Garras", "descricao_habilidade": "Ataque físico de garras (50/40), causando 1d3 pontos de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Pteros',
    'Humanoide',
    11,
    0,
    '10 M',
    $ATTR${"CON": 9, "FOR": 9, "DEX": 9, "AGI": 13, "INT": 9, "WILL": 9, "PER": 15, "CAR": 11}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar e realizar manobras complexas utilizando sua cauda e crista cartilaginosa a uma velocidade de 10 m/s."}, {"habilidade": "Ataque de Garras", "descricao_habilidade": "Ataque físico de garras (40/40) realizado com os pés durante voos rasantes, causando 1d3+1 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Pudim Negro',
    'Monstro',
    3,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque Corrosivo", "descricao_habilidade": "Ataque realizado por contato físico direto, causando 1d6 pontos de dano por corrosão por rodada. O ácido leva uma rodada para dissolver uma parte de uma armadura metálica."}, {"habilidade": "Divisão Celular", "descricao_habilidade": "Qualquer ataque físico ou elétrico bem-sucedido contra o Pudim Negro não causa dano; em vez disso, divide a criatura em duas criaturas menores. Cada metade possui os mesmos atributos do original, mas metade dos PVs atuais. Cada metade cresce de volta ao tamanho original em 1d6 horas por PV perdido."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Quelonte',
    'Monstro',
    46,
    9,
    '',
    $ATTR${"CON": 35, "FOR": 35, "DEX": 0, "AGI": 3, "INT": 2, "WILL": 2, "PER": 9, "CAR": 12}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque com bico afiado (20/0) causando 1d3+2 de dano físico."}, {"habilidade": "Montaria Selvagem", "descricao_habilidade": "Pode ser domesticado ou usado como montaria mesmo em estado selvagem, pois a carapaça possui saliências naturais que servem de apoio e a criatura não consegue remover cavaleiros de suas costas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Quimera',
    'Monstro',
    51,
    5,
    '',
    $ATTR${"CON": 40, "FOR": 40, "DEX": 4, "AGI": 11, "INT": 5, "WILL": 5, "PER": 21, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Múltiplos", "descricao_habilidade": "A criatura pode realizar até cinco ataques por turno utilizando suas armas naturais: duas garras, uma mordida de leão, uma mordida de dragão e uma marrada de bode."}, {"habilidade": "Ataque de Garras", "descricao_habilidade": "Ataque físico duplo com as garras (65/60) causando 1d6+5 de dano cada."}, {"habilidade": "Mordida de Leão", "descricao_habilidade": "Ataque físico com a cabeça de leão (70/0) causando 2d6 de dano."}, {"habilidade": "Mordida de Dragão", "descricao_habilidade": "Ataque físico com a cabeça de dragão (50/0) causando 3d6 de dano."}, {"habilidade": "Marrada de Bode", "descricao_habilidade": "Ataque físico com a cabeça de bode causando 1d6+5 de dano."}, {"habilidade": "Sopro de Chamas", "descricao_habilidade": "A cabeça de dragão vermelho cospe fogo à distância causando 6d6+6 de dano de fogo. Não requer teste para acertar; um teste de Esquiva bem-sucedido por parte da vítima reduz o dano à metade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Random',
    'Monstro',
    58,
    5,
    '',
    $ATTR${"CON": 38, "FOR": 41, "DEX": 9, "AGI": 8, "INT": 5, "WILL": 15, "PER": 21, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Percepção Cósmica", "descricao_habilidade": "Mesmo sem olhos, a criatura é capaz de perceber perfeitamente a presença de inimigos, inclusive aqueles que estejam escondidos ou invisíveis."}, {"habilidade": "Ataque de Punhos", "descricao_habilidade": "Realiza dois ataques por turno utilizando seus punhos massivos (65/60), causando 2d6+11 de dano físico cada."}, {"habilidade": "Disparar Rocha", "descricao_habilidade": "Realiza um ataque por turno expelindo uma imensa rocha a partir de suas mãos (65/0), causando 3d6 de dano."}, {"habilidade": "Instabilidade de Fraqueza", "descricao_habilidade": "A criatura é imune a quase todas as formas de dano físico e mágico. Sua única fraqueza muda toda vez que o monstro desperta de uma hibernação. O mestre deve rolar 2d6 na tabela para definir o único tipo de dano que o afetará normalmente (sofrendo IP 5): \n2) Corte\n3) Perfuração\n4) Contusão\n5) Explosão\n6) Calor/Fogo\n7) Frio/Gelo\n8) Luz\n9) Trevas\n10) Eletricidade\n11) Som/Vento\n12) Químico."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ratazana Comum',
    'Monstro',
    1,
    0,
    '',
    $ATTR${"CON": 1, "FOR": 1, "DEX": 0, "AGI": 12, "INT": 1, "WILL": 1, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico de mordida (25/0) que causa 1d2 de dano. Há uma chance de 10% de transmitir doenças ao alvo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Ratazana Gigante',
    'Monstro',
    6,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 4, "DEX": 1, "AGI": 12, "INT": 1, "WILL": 1, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico de mordida (35/0) que causa 1d3+1 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Rato da noite',
    'Morto-Vivo',
    3,
    0,
    '',
    $ATTR${"CON": 3, "FOR": 3, "DEX": 0, "AGI": 12, "INT": 1, "WILL": 1, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico de mordida (25/0) que causa 1d3 de dano. Há 10% de chance de infectar o alvo com doenças."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Rinoceronte da Savana',
    'Monstro',
    41,
    6,
    '20 M',
    $ATTR${"CON": 35, "FOR": 35, "DEX": 3, "AGI": 11, "INT": 2, "WILL": 2, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Chifre", "descricao_habilidade": "Ataque físico com o chifre (65/0), causando 1d6+11 de dano."}, {"habilidade": "Arremetida em Corrida", "descricao_habilidade": "Ataque especial de investida em linha reta a até 20 km/h (50/0), aplicando um redutor de H-1 e causando 3d6+15 de dano de impacto."}, {"habilidade": "Atropelamento", "descricao_habilidade": "Ataque de área por esmagamento ao passar por cima de oponentes, causando dano equivalente à Força da criatura subtraído de 1d6 (35 - 1d6)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Rinoceronte Lanoso',
    'Monstro',
    45,
    7,
    '20 M',
    $ATTR${"CON": 41, "FOR": 41, "DEX": 3, "AGI": 11, "INT": 2, "WILL": 2, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Chifre", "descricao_habilidade": "Ataque físico com o chifre (60/0), causando 1d6+11 de dano."}, {"habilidade": "Arremetida em Corrida", "descricao_habilidade": "Ataque especial de investida em linha reta (H-1 para o teste), desferindo um golpe devastador com o chifre que causa dano baseado em sua Força somado a 3d6 (41 + 3d6)."}, {"habilidade": "Atropelamento", "descricao_habilidade": "Esmaga oponentes em seu caminho ao avançar, causando dano equivalente à sua Força subtraído de 1d6 (41 - 1d6)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Brontotério',
    'Monstro',
    47,
    6,
    '20 M',
    $ATTR${"CON": 43, "FOR": 43, "DEX": 3, "AGI": 11, "INT": 2, "WILL": 2, "PER": 10, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Chifre em Y", "descricao_habilidade": "Ataque físico com o chifre bifurcado (70/0), causando 1d6+13 de dano."}, {"habilidade": "Arremetida em Corrida", "descricao_habilidade": "Investida em linha reta (50/0) aplicando um redutor de H-1 e causando 3d6+15 de dano de impacto."}, {"habilidade": "Atropelamento", "descricao_habilidade": "Esmaga oponentes sob suas patas massivas ao avançar, causando dano equivalente à sua Força subtraído de 1d6 (43 - 1d6)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Salamandra de Fogo',
    'Monstro',
    28,
    3,
    '',
    $ATTR${"CON": 23, "FOR": 23, "DEX": 2, "AGI": 15, "INT": 1, "WILL": 1, "PER": 16, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Aura de Calor", "descricao_habilidade": "Emana calor constante que causa 1d3 pontos de dano por rodada a qualquer criatura a menos de 6 metros de distância, e 1d6 pontos de dano por rodada a quem estiver a menos de 1 metro."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico de mordida (45/60) que causa 1d6 + bônus de dano."}, {"habilidade": "Bafo de Fogo", "descricao_habilidade": "Dispara um jato de escória quente pela boca causando 5d6+5 de dano de fogo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Sátiro',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Disfarce Ilusório", "descricao_habilidade": "Pode assumir uma ilusão mágica para parecer completamente humano pelo tempo que desejar."}, {"habilidade": "Melodia de Fascinação", "descricao_habilidade": "Sátiros que possuam a perícia Artes podem utilizar um instrumento musical (geralmente uma flauta) para conjurar as magias 'O Canto da Sereia' e 'Fascinação' sem gasto de Pontos de Vida, utilizável exclusivamente contra mulheres."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Selako',
    'Monstro',
    28,
    3,
    '',
    $ATTR${"CON": 40, "FOR": 40, "DEX": 0, "AGI": 21, "INT": 1, "WILL": 1, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Percepção de Sangue", "descricao_habilidade": "Capaz de farejar e detectar a presença de sangue na água a até 1 km de distância."}, {"habilidade": "Frenesi Sangrento", "descricao_habilidade": "Em presença de sangue, o Selako entra em Fúria, atacando sem interrupção a cada turno até a morte do alvo ou a sua própria."}, {"habilidade": "Decisiva Mordida", "descricao_habilidade": "Ataque de mordida (65/0) que causa 4d6+4 de dano. Caso acerte, arranca um pedaço de carne da vítima, fazendo-a sangrar e perder 1 PV por turno até receber primeiros socorros."}, {"habilidade": "Pancada", "descricao_habilidade": "Ataque físico de impacto (50/0) causando 2d6+10 de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Sereia',
    'Humanoide',
    1,
    0,
    '',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Metamorfose Anfíbia", "descricao_habilidade": "Ao sair completamente da água, mesmo contra sua vontade, a cauda da sereia transforma-se magicamente em pernas, permitindo que ela se passe por uma mulher humana normal na terra."}, {"habilidade": "O Canto da Sereia", "descricao_habilidade": "Capacidade natural de conjurar a magia 'O Canto da Sereia' sem custos de Pontos de Vida e de forma ilimitada. Alvos do sexo oposto sofrem um redutor de -3 em seu Teste de Resistência para resistir aos efeitos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Anaconda',
    'Animal',
    25,
    2,
    '',
    $ATTR${"CON": 30, "FOR": 30, "DEX": 0, "AGI": 9, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico (65/0) que causa 1d3+2 de dano. Se for bem-sucedido, a anaconda prende a vítima e pode iniciar a habilidade Constrição no turno seguinte."}, {"habilidade": "Constrição", "descricao_habilidade": "Após um ataque bem-sucedido de Mordida, causa automaticamente 1d6+1 de dano por Força nos turnos seguintes, sem necessidade de testes e ignorando a armadura (IP) da vítima. Enquanto estiver presa, a vítima só pode atacar se passar em um Teste de Força e usando armas pequenas (dano máximo de 1d6 por Força). Ataques de aliados contra a serpente exigem Teste de Habilidade-1 ou causam metade do dano diretamente na vítima presa."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Píton do Deserto',
    'Animal',
    22,
    2,
    '',
    $ATTR${"CON": 25, "FOR": 20, "DEX": 0, "AGI": 9, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico (45/0) que causa 1d3+2 de dano. Se for bem-sucedido, a serpente prende a vítima e pode iniciar a habilidade Constrição no turno seguinte."}, {"habilidade": "Constrição", "descricao_habilidade": "Após um ataque bem-sucedido de Mordida, causa automaticamente 1d6+2 de dano por Força nos turnos seguintes, sem necessidade de testes e ignorando a armadura (IP) da vítima. Enquanto estiver presa, a vítima só pode atacar se passar em um Teste de Força e usando armas pequenas (dano máximo de 1d6 por Força). Ataques de aliados contra a serpente exigem Teste de Habilidade-1 ou causam metade do dano diretamente na vítima presa."}, {"habilidade": "Camuflagem Desértica", "descricao_habilidade": "Quando enterrada na areia do deserto, a Píton torna-se totalmente indetectável, mesmo para criaturas que possuem Sentidos Especiais."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Damas da Morte',
    'Monstro',
    22,
    2,
    '',
    $ATTR${"CON": 30, "FOR": 26, "DEX": 0, "AGI": 9, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida Dupla", "descricao_habilidade": "A criatura realiza dois ataques de mordida por turno (55/0), cada um causando 1d3+4 de dano. Se ao menos um deles for bem-sucedido, ela prende a vítima e pode iniciar a habilidade Constrição no turno seguinte."}, {"habilidade": "Constrição", "descricao_habilidade": "Após um ataque bem-sucedido de Mordida, causa automaticamente 1d6+3 de dano por Força nos turnos seguintes, sem necessidade de testes e ignorando a armadura (IP) da vítima. Enquanto estiver presa, a vítima só pode atacar se passar em um Teste de Força e usando armas pequenas (dano máximo de 1d6 por Força). Ataques de aliados contra a serpente exigem Teste de Habilidade-1 ou causam metade do dano diretamente na vítima presa."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cascavel',
    'Animal',
    8,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 3, "DEX": 0, "AGI": 12, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico (45/0) que causa 1d2 pontos de dano e injeta uma peçonha que exige um Teste de Resistência da vítima para não ser envenenada."}, {"habilidade": "Veneno Mortal", "descricao_habilidade": "Se a vítima falhar no Teste de Resistência contra a Mordida, ela é envenenada. Sofre um redutor temporário de -1 em todas as suas Características e perde 1 PV por rodada até a morte ou cura. Sofre 1d6 de dano por rodada (um teste de CON por rodada reduz o dano daquela rodada pela metade) até o máximo de 6d6 de dano acumulado. Pode ser detido com um teste bem-sucedido de Medicina (Habilidade+1) ou magia de Cura (que apenas interrompe o veneno e não restaura PV)."}, {"habilidade": "Guiso de Alerta", "descricao_habilidade": "Quando ameaçada, a cascavel faz soar o guiso de sua cauda como aviso. Ela não atacará no primeiro turno da ameaça, desferindo o bote somente no turno seguinte caso o agressor não se afaste."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Naja',
    'Animal',
    8,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 3, "DEX": 0, "AGI": 12, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico (45/0) que causa 1d2 pontos de dano e injeta uma peçonha altamente letal."}, {"habilidade": "Veneno Mortal Concentrado", "descricao_habilidade": "Se a vítima falhar no Teste de Resistência contra a Mordida, ela é envenenada. Sofre um redutor temporário de -1 em todas as Características e perde 2 PV por rodada até a morte ou cura. Sofre 1d6 de dano por rodada (um teste de CON por rodada reduz o dano pela metade) até o limite máximo de 7d6 de dano acumulado. Pode ser detido com teste de Medicina (Habilidade+1) ou magia de Cura (que apenas interrompe o veneno, sem recuperar PV)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cuspideira',
    'Animal',
    8,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 3, "DEX": 0, "AGI": 12, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico (45/0) que causa 1d2 pontos de dano e injeta o veneno padrão."}, {"habilidade": "Cuspir Veneno", "descricao_habilidade": "O veneno disparado causa efeito de Paralisia na vítima."}, {"habilidade": "Veneno Paralisante", "descricao_habilidade": "O veneno expelido pela cuspideira possui propriedades paralisantes em vez de letais diretas, agindo de forma idêntica à Vantagem Paralisia do sistema."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Serpente Marinha',
    'Animal',
    9,
    0,
    '',
    $ATTR${"CON": 6, "FOR": 3, "DEX": 0, "AGI": 17, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico (45/0) que causa 1d2 pontos de dano e injeta uma peçonha oceânica extremamente destrutiva."}, {"habilidade": "Veneno Marinho Fulminante", "descricao_habilidade": "Se a vítima falhar no Teste de Resistência contra a Mordida, ela é envenenada. Sofre um redutor temporário de -1 em todas as Características e perde 3 PV por rodada até morrer ou ser curada. Sofre 1d6 de dano por rodada (teste de CON por rodada reduz o dano pela metade) até atingir o teto drástico de 10d6 de dano acumulado. Pode ser interrompido com teste de Medicina (Habilidade+1) ou magia de Cura (que serve apenas para cessar a progressão do veneno)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Cobra-Rei',
    'Animal',
    13,
    1,
    '',
    $ATTR${"CON": 11, "FOR": 13, "DEX": 0, "AGI": 7, "INT": 1, "WILL": 1, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico (55/0) que causa 1d2 de dano e introduz o veneno da criatura. Se for bem-sucedido, o monstro também aprisiona o alvo para aplicar a Constrição no turno seguinte."}, {"habilidade": "Veneno Mortal", "descricao_habilidade": "Caso a vítima falhe no Teste de Resistência contra a Mordida, é envenenada. Sofre um redutor temporário de -1 em todas as suas Características e perde 1 PV por rodada até ser curada ou morrer. Sofre 1d6 de dano por rodada (um teste de CON por rodada reduz o dano daquela rodada pela metade) até o limite máximo de 3d6 de dano. Pode ser contido com teste de Medicina (Habilidade+1) ou qualquer magia de Cura (que interrompe o efeito sem regenerar PV)."}, {"habilidade": "Constrição", "descricao_habilidade": "Ataque automático de esmagamento desferido após a mordida. Causa 1d6+3 de dano por rodada, sem necessidade de novos testes de ataque e impedindo a vítima de absorver o dano com testes de Armadura/IP."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Siba Gigante',
    'Monstro',
    38,
    8,
    '',
    $ATTR${"CON": 36, "FOR": 30, "DEX": 3, "AGI": 9, "INT": 1, "WILL": 1, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Camuflagem de Sangue Frio", "descricao_habilidade": "A criatura possui 75% de invisibilidade devido à sua altíssima capacidade de mudar de cor em frações de segundo e mimetizar o ambiente, inclusive adotando textura rochosa em sua pele. Por ser de sangue frio, sua temperatura corporal iguala-se à do ambiente, tornando-a imune a detecção por Infravisão, Ver o Invisível ou Radar."}, {"habilidade": "Luzes Hipnóticas", "descricao_habilidade": "Luzes não mágicas que pulsam pelo corpo formando padrões intrincados. Qualquer criatura que olhar para a siba deve realizar um Teste de Resistência (WILL) a cada rodada. Em caso de falha, fica hipnotizada/encantada (efeito idêntico à magia Fascinação) por 1d6 rodadas, limitando-se apenas a admirar o brilho."}, {"habilidade": "Laçada de Tentáculos Longos", "descricao_habilidade": "A siba pode disparar dois tentáculos longos e finos ocultos sob os demais (ataque 30/0). Não causam dano imediato (1 pt de impacto), mas forçam a vítima a passar em um Teste de Força. Em caso de falha, o alvo é arrastado em direção ao seu bico."}, {"habilidade": "Mordida de Bico e Esmagamento", "descricao_habilidade": "Ataque físico (45/0) que causa 2d6 de dano. Se a vítima tiver sido arrastada pelos tentáculos longos, ela passa a sofrer automaticamente o dano de Força+1d6 por rodada enquanto for mantida presa pela musculatura dos outros tentáculos (que possuem FOR 5)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Slark',
    'Monstro',
    9,
    0,
    '5 M',
    $ATTR${"CON": 9, "FOR": 7, "DEX": 7, "AGI": 9, "INT": 5, "WILL": 5, "PER": 14, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico simples com suas garras (35/0) causando 1d3 pontos de dano."}, {"habilidade": "Emboscada Descendente", "descricao_habilidade": "O ataque inicial do slark costuma ser uma queda surpresa do teto sobre sua presa. Esse bote causa 1d6 de dano de impacto imediato."}, {"habilidade": "Saliva Apaga-Tochas", "descricao_habilidade": "Enquanto espreitam do teto de túneis, os slarks podem cuspir uma saliva grossa e gosmenta para extinguir as tochas dos aventureiros. A vítima pode evitar o efeito passando em um Teste de Habilidade."}, {"habilidade": "Escalar Paredes", "descricao_habilidade": "O slark pode caminhar livremente por tetos e paredes com velocidade de 5m/s (mas é incapaz de lutar enquanto realiza essa movimentação)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Shimay',
    'Demônio',
    20,
    3,
    '',
    $ATTR${"CON": 12, "FOR": 15, "DEX": 15, "AGI": 13, "INT": 6, "WILL": 6, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Disparo de Hastes Ácidas", "descricao_habilidade": "Ataque à distância (60/0) disparando as hastes espinhosas de suas costas. Causa 4d6 de dano no total (2d6 físicos + 2d6 de ácido concentrado). O ácido derrete metal e ignora completamente o IP/Armadura do alvo, agindo como se a vítima tivesse Vulnerabilidade a Químico (personagens com Armadura Extra contra químico podem realizar um Teste Normal; Invulnerabilidade funciona normalmente)."}, {"habilidade": "Golpe de Arco", "descricao_habilidade": "Ataque em combate corporal (40/40) utilizando sua estrutura óssea do braço esquerdo como arma contundente, causando 1d6 de dano físico (ou 2d6 conforme a força do golpe)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Shinobi',
    'Demônio',
    22,
    3,
    '',
    $ATTR${"CON": 13, "FOR": 13, "DEX": 13, "AGI": 16, "INT": 13, "WILL": 13, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Manto de Disfarce", "descricao_habilidade": "O shinobi pode se disfarçar como um humano vestindo um manto. O disfarce funciona perfeitamente à distância ou sob más condições de visibilidade (escuridão, chuva, neblina). Um olhar cuidadoso e próximo revela sua verdadeira face de inseto."}, {"habilidade": "Voo e Escalar Paredes", "descricao_habilidade": "O demônio é capaz de voar e caminhar livremente por tetos e paredes verticais."}, {"habilidade": "Garras", "descricao_habilidade": "Ataque físico duplo (50/50) com suas garras afiadas, causando 2d6 de dano por golpe."}, {"habilidade": "Mordida Peçonhenta", "descricao_habilidade": "Ataque físico (65/0) com suas mandíbulas que causa 1d6+1 de dano. Caso cause dano, a vítima deve passar em um Teste de Resistência; em caso de falha, sofre um dano extra e imediato de 2d6 de veneno (que não pode ser absorvido por IP ou armadura)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Soldados-Mortos',
    'Morto-Vivo',
    22,
    3,
    '',
    $ATTR${"CON": 18, "FOR": 18, "DEX": 13, "AGI": 14, "INT": 0, "WILL": 0, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque com Arma", "descricao_habilidade": "Realiza dois ataques por turno (60/40) utilizando suas armas de combate equipadas, causando o dano base da arma somado aos bônus de Força."}, {"habilidade": "Resistência Espiritual Ampliada", "descricao_habilidade": "Garante ao soldado-morto um bônus de +1 (+5% de chance) em seus testes de Resistência contra tentativas de Esconjuro de Mortos-Vivos."}, {"habilidade": "Vontade de Ferro", "descricao_habilidade": "A fixação de combate protege a criatura contra dominação, exigindo conjuradores extremamente poderosos. O soldado-morto recebe um bônus de R+4 em testes para resistir a magias ou habilidades de Controle de Mortos-Vivos."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Sprites',
    'Fada',
    1,
    0,
    '5 M',
    $ATTR${"CON": 0, "FOR": 0, "DEX": 0, "AGI": 0, "INT": 0, "WILL": 0, "PER": 0, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Magia Inata", "descricao_habilidade": "Todos os sprites possuem habilidades mágicas naturais para conjurar feitiços, embora raramente desenvolvam novas magias devido à falta de disciplina."}, {"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar livremente utilizando suas asas de inseto."}, {"habilidade": "Morte por Ruptura", "descricao_habilidade": "Um sprite morre imediatamente ao entrar em qualquer área sob efeito da Ruptura. Poucas rodadas após falecer, seu corpo se desfaz em poeira brilhante, tornando impossível a ressurreição tradicional (apenas a magia Desejo pode trazê-lo de volta)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Carangueijo da Ruptura',
    'Demônio',
    60,
    10,
    '',
    $ATTR${"CON": 35, "FOR": 35, "DEX": 6, "AGI": 12, "INT": 6, "WILL": 6, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Pinças", "descricao_habilidade": "Realiza dois ataques de pinça por turno (55/45) que causam 5d6 de dano cada. Possui efeito decapante/cortante (Vorpal). Se acertar, tenta agarrar a vítima."}, {"habilidade": "Camuflagem Ácida", "descricao_habilidade": "Sua couraça escarlate confere camuflagem perfeita dentro de rios e lagos de ácido da Ruptura. Quando imóvel nessas condições, torna-se quase invisível (exige-se Teste de Habilidade -2 dos oponentes para percebê-lo)."}, {"habilidade": "Borrifo de Ácido", "descricao_habilidade": "Dispara um jato de ácido concentrado a até 15 metros de distância, causando 7d6 pontos de dano químico. Alvos podem realizar um teste de Esquiva para reduzir o dano à metade. Pode ser usado até 3 vezes por dia."}, {"habilidade": "Salva de Espinhos", "descricao_habilidade": "Quando acuada, a criatura dispara espinhos em todas as direções em um raio de 15 metros. Atinge todos os alvos na área disparando 1d6 espinhos contra cada um (acerto automático). Cada espinho causa 1d6+2 de dano físico e inocula veneno paralisante (vítimas devem passar em Teste de Resistência ou ficam paralisadas por 2d6 turnos). Pode ser usado até 3 vezes por dia."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Rei homem-formiga da Ruptura',
    'Demônio',
    25,
    4,
    '',
    $ATTR${"CON": 17, "FOR": 17, "DEX": 12, "AGI": 17, "INT": 6, "WILL": 10, "PER": 16, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico (55/45) desferido com a garra do braço esquerdo, causando 3d6 de dano."}, {"habilidade": "Esmagamento de Mandíbulas", "descricao_habilidade": "Ataque físico (65/0) desferido com o bico/mandíbulas, causando 2d6 de dano."}, {"habilidade": "Pinças Esmagadoras", "descricao_habilidade": "Ataca utilizando as duas imensas pinças do lado direito. Causa dano equivalente à sua Força com cada uma delas e inicia um teste de agarramento."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Tasloi',
    'Humanoide',
    12,
    0,
    '',
    $ATTR${"CON": 7, "FOR": 7, "DEX": 11, "AGI": 11, "INT": 8, "WILL": 8, "PER": 9, "CAR": 12}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Briga", "descricao_habilidade": "Ataque físico de combate corpo a corpo (25/30) que causa 1d3 de dano físico."}, {"habilidade": "Pés Preênseis", "descricao_habilidade": "Seus pés ágeis possuem a mesma capacidade motora e de preensão que as mãos, permitindo segurar ou manipular objetos com facilidade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Tatu-Montanha',
    'Monstro',
    70,
    10,
    '',
    $ATTR${"CON": 55, "FOR": 55, "DEX": 0, "AGI": 5, "INT": 1, "WILL": 1, "PER": 9, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Esmagamento", "descricao_habilidade": "Esmaga o oponente causando 2d6+2 pontos de dano físico por rodada."}, {"habilidade": "Retrair e Contra-atacar", "descricao_habilidade": "Ao ser atacado, o tatu-montanha recolhe-se sob sua carapaça protetora e tenta golpear o agressor desferindo ataques com sua cauda espinhosa."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Tentacute',
    'Animal',
    2,
    0,
    '',
    $ATTR${"CON": 2, "FOR": 2, "DEX": 2, "AGI": 15, "INT": 2, "WILL": 2, "PER": 15, "CAR": 17}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Agilidade Arborícola", "descricao_habilidade": "O tentacute possui extrema agilidade e velocidade de locomoção quando está sobre as árvores (recebendo Habilidade 4 para fins de movimentação e fuga)."}, {"habilidade": "Cleptomania de Itens Brilhantes", "descricao_habilidade": "Atraído por objetos pequenos e brilhantes, como moedas e gemas, o tentacute tentará roubá-los e escondê-los em sua toca no topo das árvores."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Terizinossauro',
    'Monstro',
    30,
    1,
    '',
    $ATTR${"CON": 20, "FOR": 30, "DEX": 9, "AGI": 14, "INT": 1, "WILL": 1, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques por rodada com as garras. Ataque: 60/60. Dano: 2d6 (ou Força + 1d6 no texto descritivo)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com mordida potente. Ataque: 40/0. Dano: 1d6+9 (ou Força no texto descritivo)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Tigre-de-ilusões',
    'Monstro',
    31,
    0,
    '',
    $ATTR${"CON": 28, "FOR": 30, "DEX": 3, "AGI": 18, "INT": 3, "WILL": 7, "PER": 18, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Múltiplos Ataques", "descricao_habilidade": "A fera pode realizar no máximo 8 ataques por turno combinando suas armas naturais disponíveis de acordo com sua anatomia variável."}, {"habilidade": "Garras", "descricao_habilidade": "Ataques realizados através de suas patas (de 4 a 6 garras). Ataque: 60/40. Dano: 2d6 (ou Força - 1d6 no texto descritivo)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataques com suas mandíbulas (de 1 a 3 cabeças). Ataque: 40/0. Dano: 1d10+1 (ou Força no texto descritivo)."}, {"habilidade": "Tentáculos", "descricao_habilidade": "Ataques com apêndices elásticos (de 1 a 6 tentáculos). Causa dano por Força - 1d6."}, {"habilidade": "Corpo Desfocado", "descricao_habilidade": "Qualquer tipo de Sentido Especial falha contra o tigre. Atacá-lo exige sempre um teste de Habilidade com redutor de -2 (H-2). Magias ou ataques que acertam automaticamente só o atingem com um resultado de 1 ou 2 em um dado de 6 lados (1d6)."}, {"habilidade": "Teleporte", "descricao_habilidade": "Capacidade inerente de teleportar-se, tornando impossível prendê-lo em armadilhas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Toscos',
    'Construto',
    19,
    1,
    '',
    $ATTR${"CON": 16, "FOR": 18, "DEX": 8, "AGI": 8, "INT": 1, "WILL": 1, "PER": 7, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataques Desarmados", "descricao_habilidade": "Quando desarmado, o tosco pode realizar até três ataques por rodada utilizando garras e mordida. Ataque: 50/50. Dano: 1d6+2 (ou Força - 1d6)."}, {"habilidade": "Sentidos Sobrenaturais", "descricao_habilidade": "O tosco é capaz de enxergar no escuro, ver coisas invisíveis e possui a habilidade natural de Detecção de Magia."}, {"habilidade": "Bússola do Criador", "descricao_habilidade": "O tosco sempre sabe dizer com precisão em qual direção e distância seu mestre criador se encontra."}, {"habilidade": "Adaptador", "descricao_habilidade": "Capacidade instintiva de lutar perfeitamente com qualquer arma física em mãos, mesmo aquelas de formatos bizarros e inutilizáveis para outras criaturas."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'T-Rex',
    'Monstro',
    55,
    3,
    '',
    $ATTR${"CON": 46, "FOR": 43, "DEX": 3, "AGI": 8, "INT": 1, "WILL": 1, "PER": 6, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque devastador com sua mandíbula musculosa. Ataque: 60/20. Dano: 4d6+6 (ou Força no texto descritivo)."}, {"habilidade": "Pisotear e Imobilizar", "descricao_habilidade": "Utiliza suas poderosas patas traseiras para correr em alta velocidade (estimada em até 50km/h) e imobilizar presas pequenas ou fracas pisando nelas. Para escapar da imobilização, a vítima deve passar em um Teste de Força."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Triceratops',
    'Monstro',
    55,
    6,
    '',
    $ATTR${"CON": 46, "FOR": 43, "DEX": 3, "AGI": 8, "INT": 1, "WILL": 1, "PER": 6, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Chifres", "descricao_habilidade": "Ataque básico utilizando seus chifres frontais. Ataque: 60/20. Dano: 3d6+6 (ou Força+1d6 para cabeçada no texto descritivo)."}, {"habilidade": "Carga", "descricao_habilidade": "Ataque Especial que consiste em correr e arremeter contra o alvo a até 20 km/h. Ataque: 50/0. Dano: 5d6+6 (ou Força+3d6 no texto descritivo, com o redutor normal de H-1)."}, {"habilidade": "Atropelamento", "descricao_habilidade": "Causa dano por Força-1d6 ao passar por cima de oponentes durante o movimento."}, {"habilidade": "Escudo Ósseo", "descricao_habilidade": "A crista óssea protege sua cabeça e pescoço. Pode ser usada como um escudo normal, oferecendo a capacidade de Deflexão para proteger a si mesmo ou a quem o estiver cavalgando."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Trobos',
    'Monstro',
    35,
    2,
    '',
    $ATTR${"CON": 36, "FOR": 31, "DEX": 2, "AGI": 10, "INT": 1, "WILL": 1, "PER": 6, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Cabeçada", "descricao_habilidade": "Golpe desferido com seus chifres. Ataque: 50/0. Dano: 1d6+3."}, {"habilidade": "Montaria de Longo Curso", "descricao_habilidade": "São montarias muito confortáveis devido ao tronco largo e depósitos de gordura. Embora lentos se comparados a cavalos, demoram muito mais para se cansar, sendo capazes de andar de oito a dez vezes mais tempo antes de precisar de descanso."}, {"habilidade": "Ponto Fraco (Equilíbrio Lento)", "descricao_habilidade": "O trobo possui dificuldade em ajustar seu equilíbrio corporal rapidamente. Qualquer ataque ou manobra que tenha como objetivo desestabilizar a criatura constantemente fará com que ela caia no chão."}, {"habilidade": "Resistência Mágica Superior", "descricao_habilidade": "Trobos são naturalmente mais resistentes a efeitos e magias do que animais comuns."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Trogloditas',
    'Humanoide',
    18,
    2,
    '',
    $ATTR${"CON": 16, "FOR": 18, "DEX": 13, "AGI": 14, "INT": 11, "WILL": 14, "PER": 14, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico básico utilizando suas garras naturais. Ataque: 50/50. Dano: 1d6+2."}, {"habilidade": "Ataque com Arma", "descricao_habilidade": "Ataque utilizando armas fabricadas roubadas (comumente lanças ou dardos). Ataque: 50/50. Dano: de acordo com a arma utilizada."}, {"habilidade": "Camuflagem Camaleônica", "descricao_habilidade": "A criatura consegue alterar a cor de sua pele para se misturar ao ambiente rochoso ou escuro, tornando-se quase impossível de ser notada à noite."}, {"habilidade": "Nuvem de Óleo Fétido", "descricao_habilidade": "Quando irritado, secreta através da pele um óleo de odor insuportável. Qualquer humano ou semi-humano em combate fechado (ou a até 1m) deve realizar um Teste de Resistência; em caso de falha, perde temporariamente 1 ponto de Força por 10 rodadas. Limitação: utilizável apenas uma vez a cada 24 horas."}, {"habilidade": "Vulnerabilidade ao Frio", "descricao_habilidade": "Por possuírem sangue frio, são anatomicamente mais vulneráveis a climas gélidos e a magias baseadas em frio."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Troll do Pântano',
    'Humanoide',
    18,
    2,
    '',
    $ATTR${"CON": 24, "FOR": 27, "DEX": 7, "AGI": 8, "INT": 4, "WILL": 4, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza ataques cortantes com suas garras naturais. Ataque: 60/50. Dano: 2d6+4 (ou dano por Força)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com suas presas. Ataque: 50/0. Dano: 1d10 (ou Força + 1d6)."}, {"habilidade": "Regeneração de Combate", "descricao_habilidade": "A criatura recupera 2 PVs por turno (ou 1 PV por rodada). Mesmo se for reduzido a 0 PVs, seus restos continuarão se regenerando até reconstituir o monstro por completo."}, {"habilidade": "Vulnerabilidade a Fogo e Ácido", "descricao_habilidade": "O troll não consegue regenerar danos causados por ataques baseados em fogo ou ácido. Esta é a única forma de matá-lo definitivamente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Troll Ghillanin',
    'Humanoide',
    18,
    2,
    '',
    $ATTR${"CON": 24, "FOR": 27, "DEX": 7, "AGI": 8, "INT": 4, "WILL": 4, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque básico com as garras. Ataque: 60/50. Dano: 2d6+4 (ou dano por Força)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com as presas. Ataque: 50/0. Dano: 1d10 (ou Força + 1d6)."}, {"habilidade": "Regeneração de Combate", "descricao_habilidade": "Recupera 2 PVs por turno. Não se regenera de danos por fogo ou ácido."}, {"habilidade": "Hipersensibilidade à Luz Solar", "descricao_habilidade": "Extremamente sensível à luz do dia. Sofre 1 ponto de dano por turno quando tocado diretamente pelos raios solares."}, {"habilidade": "Vulnerabilidade a Fogo e Ácido", "descricao_habilidade": "Não regenera danos causados por fogo ou ácido."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Troll Glacioli',
    'Humanoide',
    18,
    2,
    '',
    $ATTR${"CON": 24, "FOR": 27, "DEX": 7, "AGI": 8, "INT": 4, "WILL": 4, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque básico com as garras. Ataque: 60/50. Dano: 2d6+4 (ou dano por Força)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com as presas. Ataque: 50/0. Dano: 1d10 (ou Força + 1d6)."}, {"habilidade": "Regeneração de Combate", "descricao_habilidade": "Recupera 2 PVs por turno. Não se regenera de danos por fogo ou ácido."}, {"habilidade": "Absorção de Frio", "descricao_habilidade": "Além de imune, o Glacioli absorve o dano de ataques ou magias baseadas em frio. Esse dano é convertido em PVs extras que aumentam o seu tamanho. Para cada 5 PVs excedentes adquiridos dessa forma, a criatura ganha temporariamente +1 em Força (FOR), +1 em Constituição (CON) e +1 de Armadura (IP)."}, {"habilidade": "Vulnerabilidade a Fogo e Ácido", "descricao_habilidade": "Não regenera danos causados por fogo ou ácido."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Troll Vrakoll',
    'Humanoide',
    18,
    2,
    '',
    $ATTR${"CON": 24, "FOR": 27, "DEX": 7, "AGI": 8, "INT": 4, "WILL": 4, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque básico com as garras. Ataque: 60/50. Dano: 2d6+4 (ou dano por Força)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com as presas. Ataque: 50/0. Dano: 1d10 (ou Força + 1d6)."}, {"habilidade": "Regeneração de Combate", "descricao_habilidade": "Recupera 2 PVs por turno. Não se regenera de danos por fogo ou ácido."}, {"habilidade": "Anfíbio", "descricao_habilidade": "A criatura é perfeitamente capaz de respirar, viver e se locomover sob a água sem sofrer penalidades."}, {"habilidade": "Sentidos Especiais (Radar)", "descricao_habilidade": "Possui a capacidade de perceber o ambiente tridimensionalmente por meio de ecolocalização ou ondas físicas na água."}, {"habilidade": "Vulnerabilidade a Fogo e Ácido", "descricao_habilidade": "Não regenera danos causados por fogo ou ácido."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Troll Gigante',
    'Humanoide',
    41,
    3,
    '',
    $ATTR${"CON": 34, "FOR": 37, "DEX": 7, "AGI": 8, "INT": 4, "WILL": 4, "PER": 14, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataques cortantes com suas garras naturais. Ataque: 60/50. Dano: 2d6+9 (ou dano baseado em Força)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com suas presas poderosas. Ataque: 55/0. Dano: 2d10 (ou Força - 1)."}, {"habilidade": "Regeneração Aprimorada", "descricao_habilidade": "O troll gigante recupera 3 PVs por rodada. Mesmo se for reduzido a 0 PVs, seus restos se regeneram até reconstituírem a criatura por completo, exceto por danos provocados por fogo ou ácido."}, {"habilidade": "Vulnerabilidade a Fogo e Ácido", "descricao_habilidade": "O troll gigante é incapaz de regenerar danos causados por fogo ou ácido. Esta é a única maneira de matá-lo de forma definitiva."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Urso Negro',
    'Monstro',
    40,
    1,
    '',
    $ATTR${"CON": 35, "FOR": 35, "DEX": 3, "AGI": 8, "INT": 2, "WILL": 2, "PER": 14, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques rápidos com as garras. Ataque: 60/50. Dano: 1d6+10 (ou Força - 1d6)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com suas potentes mandíbulas. Ataque: 50/0. Dano: 1d10 (ou Força)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Urso Marrom',
    'Monstro',
    40,
    1,
    '',
    $ATTR${"CON": 35, "FOR": 35, "DEX": 3, "AGI": 8, "INT": 2, "WILL": 2, "PER": 14, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques rápidos com as garras. Ataque: 60/50. Dano: 1d6+10 (ou Força - 1d6)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com suas potentes mandíbulas. Ataque: 50/0. Dano: 1d10 (ou Força)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Urso-Folhagem',
    'Monstro',
    40,
    1,
    '',
    $ATTR${"CON": 35, "FOR": 35, "DEX": 3, "AGI": 8, "INT": 2, "WILL": 2, "PER": 14, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques rápidos com as garras. Ataque: 65/45. Dano: 1d6+9 (ou Força - 1d6)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com suas mandíbulas. Ataque: 50/0. Dano: 1d10 (ou Força)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Urso Branco',
    'Monstro',
    45,
    2,
    '',
    $ATTR${"CON": 40, "FOR": 40, "DEX": 3, "AGI": 8, "INT": 2, "WILL": 2, "PER": 14, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques rápidos com as garras. Ataque: 65/45. Dano: 1d6+11 (ou Força - 1d6)."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com suas mandíbulas adaptadas. Ataque: 50/0. Dano: 1d10+2 (ou Força)."}, {"habilidade": "Anfíbio", "descricao_habilidade": "A criatura é uma excelente nadadora, capaz de mover-se e respirar eficientemente sob a água gélida."}, {"habilidade": "Armadura Extra (Frio/Gelo)", "descricao_habilidade": "O urso branco possui extrema resistência fisiológica contra ataques e danos baseados em frio ou gelo."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Urso Panda',
    'Monstro',
    27,
    0,
    '',
    $ATTR${"CON": 27, "FOR": 27, "DEX": 5, "AGI": 9, "INT": 3, "WILL": 2, "PER": 14, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque de garras focado em autodefesa. Ataque: 35/35. Dano: 1d6+6."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque básico de mordida. Ataque: 50/0. Dano: 1d6+2."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Urso das Cavernas',
    'Monstro',
    50,
    3,
    '',
    $ATTR${"CON": 43, "FOR": 43, "DEX": 3, "AGI": 8, "INT": 2, "WILL": 2, "PER": 14, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Realiza dois ataques violentos com suas grandes garras. Ataque: 60/50. Dano: 2d6+10."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque cortante com sua mordida esmagadora. Ataque: 50/0. Dano: 1d10+4."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Unicórnio',
    'Monstro',
    27,
    0,
    '',
    $ATTR${"CON": 27, "FOR": 17, "DEX": 0, "AGI": 9, "INT": 9, "WILL": 14, "PER": 14, "CAR": 20}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque de Chifre", "descricao_habilidade": "Golpe defensivo com seu chifre dourado. Ataque: 45/0. Dano: 1d10+3."}, {"habilidade": "Cura Sagrada Natural", "descricao_habilidade": "Capacidade inerente de curar ferimentos e enfermidades sem custo de energia ou Pontos de Vida."}, {"habilidade": "Teletransporte Natural", "descricao_habilidade": "O unicórnio pode utilizar qualquer magia de teleportação de forma natural, sem gastar Pontos de Vida."}, {"habilidade": "Aceleração", "descricao_habilidade": "A criatura consegue atingir altas velocidades de corrida rapidamente."}, {"habilidade": "Sentidos Especiais (Todos)", "descricao_habilidade": "Possui percepção extra-sensorial e sentidos biológicos aguçados em níveis máximos."}, {"habilidade": "Pacifismo", "descricao_habilidade": "A criatura recusa-se a engajar em combates ativos, optando por fugir imediatamente diante de qualquer ameaça ou agressão."}, {"habilidade": "Dependência do Chifre", "descricao_habilidade": "Caso seu chifre seja removido, a criatura perde a fonte de seus poderes e passa a perder constantemente 1 PV por hora até a morte."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Vampiro',
    'Morto-Vivo',
    41,
    3,
    '',
    $ATTR${"CON": 26, "FOR": 26, "DEX": 18, "AGI": 26, "INT": 16, "WILL": 16, "PER": 20, "CAR": 10}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corporal utilizando suas garras afiadas. Ataque: 80/90 (x2). Dano: 1d6+8."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque com as presas para sugar o sangue da vítima. Ataque: 45/0. Dano: Especial (conforme a mecânica de drenagem de vida do sistema)."}, {"habilidade": "Disfarce Humano", "descricao_habilidade": "Se não possuírem a característica Monstruosa, vampiros podem se passar por humanos comuns sem dificuldades."}, {"habilidade": "Forma de Névoa (Poder Opcional)", "descricao_habilidade": "O vampiro se transforma em névoa. Nesta forma, adquire Levitação, torna-se imune a ataques físicos normais (podendo ser ferido apenas por magia e armas mágicas), mas fica impossibilitado de atacar ou conjurar magias."}, {"habilidade": "Formas Alternativas (Poder Opcional)", "descricao_habilidade": "Permite que o vampiro se transforme fisicamente em um lobo-das-cavernas ou em um morcego-gigante."}, {"habilidade": "Imortal (Poder Opcional)", "descricao_habilidade": "Caso seja destruído, o vampiro regenera-se e desperta 2d6 noites mais tarde em sua tumba ou local de repouso. Só pode ser morto em definitivo por exposição solar direta."}, {"habilidade": "Clericato das trevas (Poder Opcional)", "descricao_habilidade": "Atua como clérigo da Deusa das Trevas. Recebe Focus +1 em Trevas, Controle de Mortos-Vivos e torna-se completamente imune a efeitos de Esconjuro e Controle de Mortos-Vivos."}, {"habilidade": "Dependência de Sangue", "descricao_habilidade": "O vampiro precisa matar um ser senciente (humano, elfo, anão, etc.) periodicamente para se alimentar. A privação desta essência vital provoca fraqueza progressiva até a sua destruição definitiva."}, {"habilidade": "Monstruoso (Fraqueza Opcional)", "descricao_habilidade": "Apresenta feições repulsivas de morcego e presas avantajadas que impossibilitam o disfarce em sociedade, denunciando imediatamente sua natureza vampírica."}, {"habilidade": "Temores Vampíricos (Fraqueza Opcional)", "descricao_habilidade": "Exposição ao cheiro de alho, contato com água benta, visão de fogo ou de símbolos religiosos força o vampiro a sofrer os efeitos da magia Pânico."}, {"habilidade": "Invulnerabilidade (Poder Opcional)", "descricao_habilidade": "O vampiro torna-se imune a todas as formas de dano físico comum, podendo ser ferido apenas por fogo, magia e armas mágicas."}, {"habilidade": "Sensibilidade à Luz Solar", "descricao_habilidade": "Exposição direta aos raios solares causa a perda de 1 PV por turno (não regenerável) até que a criatura vire cinzas. Sob nuvens densas ou com o uso de vestes pesadas, o dano é reduzido para 1 PV por minuto."}, {"habilidade": "Vulnerabilidade à Água (Fraqueza Opcional)", "descricao_habilidade": "Obtém sempre o resultado mínimo em rolagens de Armadura contra ataques baseados em água. Adicionalmente, perde 1 PV por turno se for submerso em água corrente."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Varano de Krah',
    'Monstro',
    26,
    3,
    '',
    $ATTR${"CON": 26, "FOR": 21, "DEX": 3, "AGI": 14, "INT": 1, "WILL": 1, "PER": 20, "CAR": 3}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico de combate corpo a corpo. Dano 1d6+1. Não pode ser desferido contra o mesmo alvo do ataque de cauda na mesma rodada."}, {"habilidade": "Cauda", "descricao_habilidade": "Ataque de varredura com a cauda. Dano 1d6+4. Não pode ser desferido contra o mesmo alvo da mordida na mesma rodada."}, {"habilidade": "Couro Camaleônico", "descricao_habilidade": "O varano possui 90% de camuflagem natural, o que torna extremamente difícil avistá-lo em vegetação, sombras ou outros locais de má visibilidade."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Velocirraptor',
    'Animal',
    31,
    3,
    '',
    $ATTR${"CON": 31, "FOR": 21, "DEX": 6, "AGI": 14, "INT": 3, "WILL": 1, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras Dianteiras", "descricao_habilidade": "Ataque duplo de garras corpo a corpo. Realiza dois ataques por turno causando dano de 1d10+4 cada."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque corpo a corpo. Dano de 1d6+2."}, {"habilidade": "Bote e Presa", "descricao_habilidade": "O raptor salta sobre o alvo. Se obtiver sucesso ao agarrar com as presas e garras dianteiras, na rodada seguinte ele começará a desferir chutes automaticamente com as garras traseiras em forma de foice. Isso gera dois ataques por rodada com dano igual a Força+1d6 (sem necessidade de testes para acertar). Desalojar o raptor preso exige sucesso em um Teste de Força da vítima."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Velocis',
    'Humanoide',
    15,
    1,
    '',
    $ATTR${"CON": 10, "FOR": 10, "DEX": 10, "AGI": 17, "INT": 7, "WILL": 7, "PER": 12, "CAR": 7}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Chifres", "descricao_habilidade": "Ataque físico corpo a corpo utilizando sua galhada. Dano de 1d10."}, {"habilidade": "Camuflagem", "descricao_habilidade": "Possui 90% de camuflagem em seu ambiente natural devido ao tom de sua pele."}, {"habilidade": "Conjuração de Magia", "descricao_habilidade": "Membros mais inteligentes conseguem conjurar feitiços, focando essencialmente em magias de proteção e detecção de ameaças."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Verme-das-Cavernas',
    'Monstro',
    1,
    0,
    '',
    $ATTR${"CON": 1, "FOR": 1, "DEX": 0, "AGI": 5, "INT": 0, "WILL": 0, "PER": 5, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corpo a corpo simples. Causa 1 ponto de dano."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Massa de Vermes-das-Cavernas',
    'Monstro',
    62,
    0,
    '',
    $ATTR${"CON": 27, "FOR": 10, "DEX": 0, "AGI": 5, "INT": 0, "WILL": 0, "PER": 5, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Devorar", "descricao_habilidade": "Qualquer criatura no caminho do bando sofre 1d6 pontos de dano por rodada automaticamente. Este dano afeta mortos-vivos (mas não construtos) e não pode ser reduzido ou absorvido por testes de Armadura normais, exceto se a vítima estiver protegida por magias defensivas."}, {"habilidade": "Engolfar", "descricao_habilidade": "A massa de vermes pode engolfar criaturas que estejam a até 124 metros de distância entre si (calculado como 2 metros por PV atual do bando). Vítimas engolfadas não conseguem respirar, suportando um número de turnos igual aos seus pontos de Resistência antes de começarem a perder 1 PV extra por turno devido a asfixia."}, {"habilidade": "Mobilidade em Arena", "descricao_habilidade": "Quando estão se deslocando dentro de túneis e cavernas (sua arena natural), os vermes movem-se de forma muito ágil. Em campo aberto e ao ar livre, sua mobilidade é drasticamente reduzida."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Verme-Fantasma',
    'Espírito',
    10,
    0,
    '',
    $ATTR${"CON": 11, "FOR": 11, "DEX": 0, "AGI": 5, "INT": 0, "WILL": 0, "PER": 5, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque Surpresa", "descricao_habilidade": "Quando emerge de um cadáver para atacar, o verme-fantasma recebe um bônus de +3 em seu teste de Iniciativa na primeira rodada."}, {"habilidade": "Mordida do Limbo", "descricao_habilidade": "Ataque físico corpo a corpo. Se causar dano, a vítima deve passar em um Teste de Resistência com penalidade de -2. Em caso de falha, o alvo é transformado em um fantasma transparente e sem substância por algumas horas (com chances de se tornar permanente). Nesse estado, a vítima não pode interagir fisicamente, atacar, causar dano, ou portar equipamentos (suas roupas e armaduras caem no chão)."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Vespas da Ruptura',
    'Monstro',
    2,
    20,
    '',
    $ATTR${"CON": 1, "FOR": 1, "DEX": 0, "AGI": 10, "INT": 0, "WILL": 0, "PER": 15, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Nuvem de Ferro", "descricao_habilidade": "O bando envolve completamente criaturas de tamanho humano. Causa 1d6 pontos de dano por turno de forma contínua. Vítimas não têm direito a testes de absorção de Armadura regular, exceto se estiverem protegidas por magias de barreira ativas (como Proteção Mágica)."}, {"habilidade": "Picada Coletiva", "descricao_habilidade": "Ataque físico corpo a corpo do enxame. Causa 1 ponto de dano físico somado a um veneno debilitante que inflige 1d6 de dano extra."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Wolverine',
    'Monstro',
    21,
    1,
    '',
    $ATTR${"CON": 18, "FOR": 14, "DEX": 5, "AGI": 14, "INT": 2, "WILL": 2, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corpo a corpo utilizando suas garras afiadas. Realiza dois ataques por turno causando 1d6+3 de dano cada."}, {"habilidade": "Fúria", "descricao_habilidade": "Quando entra em combate ou é provocado, a criatura é tomada por uma selvageria implacável que eleva sua agressividade no campo de batalha."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Wyvern',
    'Monstro',
    21,
    1,
    '20 M',
    $ATTR${"CON": 28, "FOR": 14, "DEX": 5, "AGI": 16, "INT": 2, "WILL": 2, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corpo a corpo utilizando as garras de suas patas. Realiza dois ataques por rodada causando 1d6+3 de dano cada."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corpo a corpo com suas mandíbulas. Causa 1d6 de dano."}, {"habilidade": "Ferrão Venenoso de Cauda", "descricao_habilidade": "Ataque físico de cauda extremamente flexível com alcance de até 6 metros em qualquer direção. Causa 1d3 de dano. A vítima atingida deve realizar um Teste de Resistência com bônus de +1; se falhar, seus Pontos de Vida são reduzidos imediatamente a 0, exigindo um teste de Morte instantâneo. O veneno causa 4d6 de dano caso as regras de morte direta não sejam aplicadas."}, {"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar livremente e realizar manobras aéreas rápidas nos céus."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Wyvern (Variedade Rara)',
    'Monstro',
    21,
    1,
    '20 M',
    $ATTR${"CON": 28, "FOR": 14, "DEX": 5, "AGI": 16, "INT": 2, "WILL": 2, "PER": 20, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico utilizando garras corporais. Realiza dois ataques por turno causando 1d6+3 de dano cada."}, {"habilidade": "Mordida", "descricao_habilidade": "Ataque físico corpo a corpo simples. Causa 1d6 de dano."}, {"habilidade": "Sopro do Dragão", "descricao_habilidade": "Ataque ativo de sopro de chamas (Dano: 6d6+6). Não requer teste de acerto para o primeiro alvo; uma esquiva bem-sucedida da vítima reduz o dano sofrido pela metade. Esse ataque afeta criaturas vulneráveis apenas à magia, ignora resistências ou proteções mágicas normais, e ignora habilidades de Reflexão ou Deflexão. Limitado a 1 uso a cada 1 hora de descanso."}, {"habilidade": "Voo", "descricao_habilidade": "Capacidade de voar livremente e realizar botes e passagens rasantes no combate."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Besouro-tatu da Ruptura',
    'Demônio',
    42,
    6,
    '',
    $ATTR${"CON": 30, "FOR": 27, "DEX": 4, "AGI": 10, "INT": 6, "WILL": 6, "PER": 17, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corpo a corpo utilizando suas garras escavadoras. Realiza dois ataques por rodada, causando 3d6+3 de dano cada."}, {"habilidade": "Bote Subterrâneo", "descricao_habilidade": "A criatura leva um turno inteiro para mergulhar e desaparecer sob a terra. Algum tempo depois, ela ressurge em um ataque surpresa com garras. O alvo do bote sofre uma penalidade de -2 em testes de Esquiva. Se for bem-sucedido, o besouro-tatu imobiliza a vítima."}, {"habilidade": "Tragar e Mastigar", "descricao_habilidade": "Contra uma vítima imobilizada pelo seu Bote Subterrâneo, a criatura desfere um ataque automático de mandíbulas que causa 1d6 de dano por turno. A vítima pode realizar um Teste de Força por rodada para tentar se libertar."}, {"habilidade": "Radar Subterrâneo", "descricao_habilidade": "Enquanto está escavando sob a terra, o demônio possui sentidos de radar especiais, visão de raio-X e a capacidade de ver o invisível, detectando qualquer movimento com precisão absoluta."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Zumbi',
    'Morto-Vivo',
    13,
    0,
    '',
    $ATTR${"CON": 13, "FOR": 13, "DEX": 4, "AGI": 10, "INT": 0, "WILL": 0, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corpo a corpo utilizando suas mãos decrépitas. Realiza dois ataques por turno, causando 1d6+1 de dano cada."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Grande Zumbi',
    'Morto-Vivo',
    17,
    2,
    '',
    $ATTR${"CON": 16, "FOR": 16, "DEX": 4, "AGI": 10, "INT": 0, "WILL": 0, "PER": 11, "CAR": 0}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Garras", "descricao_habilidade": "Ataque físico corpo a corpo. Realiza dois ataques por rodada, causando 1d6+3 de dano cada."}, {"habilidade": "Ataque com Arma", "descricao_habilidade": "Ataque físico utilizando armas portadas. Causa o dano padrão da arma equipada somado a um bônus de +2."}]$ABIL$::jsonb,
    TRUE
);
INSERT INTO bestiary_monsters (campaign_id, name, category, pv, ip, movement, attributes, abilities, is_official)
VALUES (
    NULL,
    'Trilobita - Enxame',
    'Animal',
    15,
    1,
    '4 M',
    $ATTR${"CON": 6, "FOR": 2, "DEX": 6, "AGI": 8, "INT": 1, "WILL": 4, "PER": 8, "CAR": 2}$ATTR$::jsonb,
    $ABIL$[{"habilidade": "Ataque em Enxame", "descricao_habilidade": "Algumas centenas de pequenos trilobitas atacam em conjunto, causando de 1 ponto a 1d6 de dano por turno aos nadadores na mesma área."}, {"habilidade": "Dispersão", "descricao_habilidade": "O enxame não é propriamente 'destruído', mas se dispersa totalmente ao sofrer 15 pontos de dano acumulados."}]$ABIL$::jsonb,
    TRUE
);