# Playbook do grill — como entrevistar bem

A expertise do `plumb-grill`: montar a árvore de decisões, podá-la com a exploração, e fazer as
perguntas certas no formato certo — por rodadas, até o entendimento compartilhado.

## A árvore de decisões

Antes de perguntar qualquer coisa, liste **todas as decisões** que o tema exige para virar spec.
Pense em eixos:

- **Objetivo e sucesso** — que resultado conta como "feito"? Como se observa?
- **Escopo** — o que entra e, principalmente, o que **fica de fora**.
- **Comportamento** — regras de negócio, casos de borda, o caminho de erro (não só o feliz).
- **Dados e contratos** — formato de entrada/saída, compatibilidade com quem consome.
- **Restrições** — prazo, performance, segurança, compliance, o que não pode quebrar.
- **Integrações e impacto** — o que mais é afetado (produção, outros serviços, async).

Cada decisão é um **ramo**. Um ramo só sobrevive se a resposta **muda o resultado** E errar
**custaria refazer**. Os demais você decide sozinho (é escolha de agente).

## Podar com a exploração (antes de abrir a boca)

Para cada ramo, pergunte: **o código, o `.plumb/knowledge/`, o card ou a conversa já respondem?**

- **Sim** → pode o ramo; use a resposta e siga. Não transforme em pergunta o que você pode ler.
- **Contradição entre fontes** → isso **é** a pergunta (mostre as duas versões).
- **Não respondem, e a resposta muda o resultado** → vira pergunta.

Explore proporcional ao score: num pedido trivial, uma olhada rápida basta; num profundo, vale um
`explore` com subagentes antes de montar a árvore. O que você infere com segurança **não vira
pergunta** — no máximo entra no "Combinado" como premissa a confirmar.

## Rodadas por tema

Agrupe os ramos sobreviventes **por tema** e rode **uma rodada por tema**:

- **Quantas rodadas, qual tema, quantas perguntas** — você decide, pelo que ficou ambíguo ou é
  perigoso inferir. Sem cota fixa.
- Mande as perguntas de uma rodada **juntas** (uma chamada da ferramenta, até 4). Nunca pingue uma
  de cada vez.
- Depois de cada rodada, **reavalie a árvore**: respostas fecham ramos e às vezes **abrem** novos
  (ex.: "vai integrar com o gateway X" abre "qual ambiente / tem sandbox?"). Só abra rodada nova se
  o ramo novo muda o resultado e custa refazer.
- Se a existência de uma pergunta **depende** da resposta de outra, deixe-a para uma rodada seguinte.

## Encerrar

Pare quando a **ambiguidade baixa**: só restam decisões que não mudam o resultado ou cujo erro não
custa refazer. Entrevistar além disso é desperdício — e irrita. Na dúvida entre mais uma rodada ou
fechar, prefira fechar com uma premissa explícita no "Combinado" ("assumi X; me corrija").

## Formato de cada pergunta

```
Contexto: <uma linha — o que você já sabe e por que esta pergunta importa>
Pergunta: <uma decisão só, em linguagem de produto>
Opções:
1. <a recomendada> (Recommended) — <consequência em uma frase>
2. <alternativa> — <consequência>
3. <alternativa, se houver> — <consequência>
```

- **Uma decisão por pergunta.** Duas decisões juntas confundem a resposta.
- **Recomendação primeiro**, sempre, com o "(Recommended)" no rótulo. Você tem uma opinião — mostre.
- **Consequência por opção**, em uma frase: o usuário escolhe pelo efeito, não pelo nome.
- **Linguagem de produto**, não de implementação. Quando uma skill/MCP que já existe (ou que os
  `plumb-find-*` achariam) resolve a decisão, a recomendação já diz: "recomendo X, usando a skill Y".
- Na ferramenta: o contexto vai no texto da pergunta; a pergunta é o `question`; as opções são as
  `options`, a recomendada primeiro.

## O resumo do "Combinado" (o que sai no fim)

Toque de volta o entendimento e confirme — é o insumo que o `plumb-spec` transforma em spec:

```
**Combinado — <tema>**

- Objetivo: <o resultado, em uma frase>
- Fica de fora: <o que ficou combinado não fazer>
- Combinado: <cada decisão tomada, com a opção escolhida e o porquê em meia frase>
- Premissas: <o que você assumiu sem perguntar e quer deixar explícito>
- Em aberto: <o que ainda depende de alguém, ou "nada">
```

Confirme pela ferramenta de perguntas: "Confirma esse Combinado?", opção recomendada primeiro
(confirmar) e "Ajustar" em seguida. Se ajustar, corrija o resumo e confirme de novo.

## O que NÃO perguntar

- O que o código, o cérebro, o card ou a conversa já respondem (explore primeiro).
- Escolha de implementação (nome, estrutura de arquivo, biblioteca que o projeto já usa): é do agente.
- Mais de uma decisão na mesma pergunta; pergunta retórica; pedido de licença para continuar.
- O que não muda o que será construído nem custa refazer.

Se o usuário disser **"decide você"**, decida o que falta recomendando a opção de cada pergunta que
restava e registre no "Combinado" como escolha **daquele tema** ("o usuário pediu para eu escolher o
resto em AAAA-MM-DD"). Não vira regra geral nem vale para outro pedido — e nada é gravado no cérebro.
