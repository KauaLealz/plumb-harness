# Playbook do plan — como planejar bem

A expertise do `plumb-plan`: usar a mesma maquinaria do fluxo de mudança (`explore` → `plumb-grill`
→ `plumb-spec`) com o olho do **arquiteto**, e parar na spec aprovada. O grill e o spec têm os seus
playbooks; aqui fica o que é próprio de **desenhar antes de construir**.

## Explorar o que o código de fato faz

Um plano só vale se bate com a realidade do repositório — e o maior risco do planejamento é desenhar
sobre o sistema **imaginado**.

- Rode `explore` na área (profundidade pelo score): o caminho de código real, os pontos de extensão,
  as costuras (onde um módulo fala com outro), e o que já existe que dá para reaproveitar.
- Procure as **restrições que o código impõe**: acoplamentos, migrações pendentes, contratos com
  consumidores, dependências de versão. Uma restrição descoberta agora é uma abordagem descartada
  antes de custar.
- Leia o `.plumb/knowledge/` (projeto + global): uma decisão anterior que o plano contrariaria **é**
  uma pergunta do grill, não um detalhe a ignorar.
- Falta ferramenta para desenhar com segurança: `plumb-find-docs` (a doc atual da lib antes de apostar
  numa API), `plumb-find-mcps` (sistema cujo estado você precisa ver). Desenhar às cegas sobre uma API
  que você "acha que lembra" é dívida garantida.

## A árvore de decisões — num plano, os ramos abertos são o trabalho

No grill de uma mudança comum, você poda agressivo e fecha premissas. No **plan** a régua é mais
rígida: as decisões em aberto **são o produto**. O que muda o rumo ou a arquitetura **nunca** é
inferido em silêncio — volta ao grill como pergunta, com a sua recomendação na frente.

- Monte a árvore (ver o playbook do grill): objetivo e sucesso, escopo, comportamento, dados e
  contratos, restrições, integrações e impacto.
- Pode só o que a **exploração** fechou de fato. Na dúvida entre inferir e perguntar, num plano
  **pergunte** — o custo de uma suposição errada aqui é redesenhar tudo depois.
- O que fica em aberto e **depende de alguém** (produto, outro time, um dado que você não alcança)
  vira item explícito "Em aberto" no Combinado — não uma premissa otimista.

## Comparar abordagens de ângulos diferentes e enxertar o melhor

Quando há **2+ abordagens plausíveis** (a profunda), o valor do plan é a comparação honesta.

- Gere as opções de **ângulos diferentes** — não três variações da mesma ideia. Ângulos úteis:
  o mais simples que resolve hoje · o que escala · o que minimiza risco/reversível · o que reaproveita
  o que já existe · o que isola o blast radius.
- Avalie cada uma pelos **mesmos eixos**: esforço, risco, reversibilidade, impacto em produção/
  consumidores, custo de manutenção, e quão bem encaixa no que o código já faz. Deixe os trade-offs
  explícitos — uma abordagem "vence" num eixo e perde em outro; diga qual.
- **Enxerte o melhor:** a recomendada quase nunca é uma opção pura. Puxe o que cada alternativa tem de
  bom (o faseamento de uma, a camada de compatibilidade de outra) para a síntese.
- Rode as opções em paralelo quando a avaliação é cara (subagentes, um ângulo cada) e **sintetize você**
  a recomendada. A escolhida e o porquê vão em **1 linha no Objetivo** da spec — **não há seção
  Design**; o descartado vira uma nota curta só se for útil para quem retomar.

## Parar no lugar certo

- O ponto de parada do plan é a **spec aprovada** (spec-lint + gate). Depois dela, **não implemente** —
  nem um rascunho "para ilustrar". O código é outro passo, do `plumb-code`, quando o usuário pedir.
- A spec do plan é a **mesma** que o fluxo de mudança usa: `.plumb/work/<id>.md`, git/worktree-native.
  Por isso `plumb-code` retoma dela sem refazer grill nem spec.
- Se durante o desenho o escopo crescer ou o usuário pedir algo fora do planejado, **volte ao grill**
  (delta proporcional) e reaprove — não embuta no plano sem reabrir.

## Pegadinhas

- **Desenhar sobre o sistema imaginado**, não o real: explore antes, sempre.
- **Inferir a decisão de arquitetura** porque "é óbvia": num plano, o óbvio que muda o rumo ainda vira
  pergunta.
- **Comparar palha**: opções fracas de enfeite para a preferida parecer melhor. Compare honesto ou não
  compare.
- **Vazar para o código**: produzir implementação "só para mostrar". O entregável é a decisão + a spec.
- **Fechar com buracos**: marcar um "Em aberto" como resolvido por conta própria. O que depende de
  alguém fica visível no Combinado e na spec.
