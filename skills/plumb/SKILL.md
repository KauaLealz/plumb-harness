---
name: plumb
description: Núcleo compartilhado do Plumb v6 (as referências e o hook que as skills situacionais usam) — NÃO é a skill de uma situação. O fluxo foi desmembrado: um hook classifica a intenção e você carrega a skill específica direto. Se chegou aqui, carregue a da situação (plumb-answer, plumb-capture, plumb-investigate, plumb-change, plumb-plan, plumb-review, plumb-document, plumb-setup, plumb-reflect, plumb-align), não esta.
---

# Plumb — núcleo compartilhado (não é uma situação)

O Plumb v6 **não tem orquestrador monolítico**. Um hook, em toda mensagem, injeta o roteamento; você **classifica a intenção e carrega a skill da situação direto**. Este arquivo existe só para hospedar as referências compartilhadas e o hook — não execute um fluxo a partir dele.

## Roteamento — carregue a skill da situação

| Situação | Skill |
|---|---|
| pergunta ou explicação | `plumb-answer` |
| regra ou preferência ditada ("sempre…", "a partir de agora…") | `plumb-capture` |
| investigar ("por que…", "vê se dá…") | `plumb-investigate` |
| mudança de código (feature, projeto maior, **bug/hotfix**) | `plumb-change` (cerimônia escala: direta/padrão/profunda) |
| planejar sem construir (design/discovery) | `plumb-plan` |
| revisar/auditar código de terceiros (um PR) | `plumb-review` |
| gerar/atualizar documentação | `plumb-document` |
| preparar o repositório | `plumb-setup` |
| refletir/aprender a sessão (auto no fechamento, ou à mão) | `plumb-reflect` |
| alinhar antes de começar ("me entrevista", "grill") | `plumb-align` |

Falta de ferramenta: `plumb-find-docs` (lib, antes de escrever código), `plumb-find-mcps` (sistema sem acesso), `plumb-find-skills` (competência). Recomende pela ferramenta de perguntas; instale com o "sim".

## Referências compartilhadas (cada skill @-inclui a que usa)

- `references/brain.md` — como o agente usa o segundo cérebro (modelo v6: 5 tipos sem subtipo, nuance/ciclo em tags, alcance por hierarquia, links unificados, sem scope/status/feedback).
- `references/communication.md` — tom e comunicação (idioma do usuário, descreva o resultado não o método).
- `references/prompt-contract.md` — como montar o prompt dos subagentes (explorer/planner/implementer/tester/reviewer).
- `references/worktrees.md` — worktree por mudança padrão/profunda.
- `references/spec-template.md` — o item `work` (plano): objetivo, resultados, fases.
- `references/testing.md`, `references/parallel.md`, `references/retro-signals.md`, `references/task-manager.md`.

## Disciplinas (valem em toda situação)

- **Consulte o cérebro antes de agir; grave o que durar.** O que o usuário **ditou** grava na hora; o que você **inferiu**, ou um item no nível do workspace (transversal), pede o "sim".
- **Cerimônia proporcional:** pergunta responde direto; correção pequena vai leve; só mudança maior pede plano (`work`) e aprovação, em worktree próprio. Pedido fora do planejado ou mudança nova → **replaneja** (delta proporcional).
- **Pergunte pela ferramenta de perguntas** (opções clicáveis, recomendação primeiro).
- **Paralelize o trabalho independente** por padrão (subagentes, fases, buscas) — sequencial só com dependência real.
- **Prova antes de "pronto":** teste primeiro, rode testes e lint afetados, reporte a evidência; push/PR/merge só com o "sim".
