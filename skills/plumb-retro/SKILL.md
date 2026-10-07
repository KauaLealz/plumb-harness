---
name: plumb-retro
description: Retrospectiva do Plumb — lê os sinais de retroalimentação das mudanças arquivadas desde a última retro, agrupa as causas que se repetem (travamentos, retrabalho, gates rejeitados, correções, lacunas de ferramenta, fatos velhos) aposenta o que envelheceu ou nunca foi usado no segundo cérebro e propõe ajustes pequenos em itens do cérebro, comandos e ferramentas, cada um com evidência e um sinal-alvo para medir se funcionou. Use quando o orquestrador sugerir (a cada 5 mudanças arquivadas) ou quando o usuário pedir uma retro.
disable-model-invocation: true
---

# Plumb retro

Melhore o harness deste projeto a partir da evidência do próprio trabalho,
nunca de opinião. Cada ajuste tem que nascer de um padrão observado e
dizer qual sinal deve diminuir — é assim que a próxima retro sabe se ele
funcionou.

Fale como na seção Comunicação de `../plumb/SKILL.md`: idioma do usuário, uma linha
por etapa sobre o que você encontrou, sem ids internos nem keys do cérebro no
chat (diga o conteúdo do item).

## 1 — Coletar (barato)

1. `item_get(keys=["retro/ultima"], repo=".")`: data da última retro e os
   ajustes aplicados nela, com seus sinais-alvo (`missing` = primeira retro).
2. As mudanças concluídas desde então: `knowledge-mcp recent --since <data> --json`
   (Bash), filtrando `type: spec` do workspace/project do projeto; sem a data, as
   últimas `item_search(types=["spec"], limit=20)`. Leia só a seção `## Retro` e os
   Números do `content` de cada uma (`item_get` com as keys, de uma vez).
3. **Saúde do cérebro:** `item_search(types=["rule", "insight", "procedure",
   "pattern", "knowledge"], limit=50)`. Cada resultado traz `uses`: quantas vezes o
   item foi devolvido de propósito (busca ou foco do contexto) — a evidência de valor.
4. Se o usuário rodou `/insights` recentemente e colou o relatório, use-o
   como evidência adicional.

## 2 — Agrupar

- Junte os sinais por causa raiz, não por texto parecido. "Esqueceu de
  rodar a migration" em três mudanças diferentes é uma causa só.
- **Duas ou mais ocorrências** = padrão: candidato a ajuste.
- **Uma ocorrência** = observar: liste, não proponha.
- Item com `uses` = 0 depois de 30 dias, ou que o trabalho contradisse →
  candidato a `deprecated` (ou a reforço, se devia ter sido usado e não foi).
  Dois itens que dizem o mesmo → juntar com `supersedes`.
- Para cada ajuste da retro anterior: o sinal-alvo voltou a aparecer?
  Não → manter. Sim, menos → manter e observar. Sim, igual ou mais →
  reforçar de outro jeito ou reverter.

## 3 — Propor

Despache `plumb-dreamer` **uma vez**, no modo auditoria, com todos os
padrões, as evidências (ids das mudanças e as linhas da Retro), os
itens candidatos a aposentar com o seu palpite para cada um, o resultado dos ajustes
anteriores e o caminho absoluto de `../plumb/references/brain-items.md` (o molde). Monte o prompt pelo contrato em
`../plumb/references/prompt-contract.md`.

Prefira sempre o ajuste mais barato que ataca a causa:

1. Reforçar um item que existe e foi ignorado (o porquê no `summary`, um
   exemplo, `keywords`, `scope_paths`).
2. Um item novo (`rule`, `gotcha`) ou uma linha nos comandos do `AGENTS.md`.
3. Um `procedure` para um procedimento que se repetiu.
4. Uma ferramenta do catálogo — ou, se não houver, uma skill encontrada
   com `plumb-find-skills` — para uma lacuna que se repetiu.

Limites fixos: nunca afrouxar regra de segurança ou de dados pessoais,
nunca remover um gate, no máximo 5 ajustes por retro (aposentadorias
não contam). Um problema cuja
correção real é de arquitetura vira uma nota para o usuário, não uma regra.

## 4 — Apresentar

```
**Plumb retro — 6 mudanças (PAY-142 … fix-login)**

| Padrão | Evidência | Ajuste | Sinal-alvo |
|---|---|---|---|
| Migration esquecida antes dos testes de integração | PAY-150, PAY-161, fix-ledger | `proc/rodar-migrations` com scope migrations/** | `travamento` por schema desatualizado |

Aposentar: gotcha/cache-redis (contradito em PAY-161) · padrao/form-antigo (nunca usado em 45 dias).
Ajustes anteriores: "Money em pagamentos" — o sinal não voltou → manter.
Observar: 1 rejeição por texto de PR (fix-login).

Aplicar? (todos / 1,3 / só aposentar / nenhum)
```

## 5 — Aplicar e registrar

Grave só o que foi aprovado, numa chamada: `item_save(repo=".", items=[...])`
com os itens novos ou reforçados (mesma `key`) e as aposentadorias
(`{"key": ..., "status": "deprecated"}`). Comandos vão para o
`AGENTS.md`. No mesmo `item_save`, regrave o registro da retro (substitui o anterior;
o histórico fica nos ajustes aplicados):

```json
{"key": "retro/ultima", "type": "spec", "status": "done",
 "title": "Retro de <AAAA-MM-DD>", "summary": "<n> mudanças, <n> ajustes",
 "content": "Mudanças: <keys>\nAplicado: <item ou arquivo> — <ajuste> — alvo: <sinal que deve diminuir>\nAposentados: <n>\nObservar: <padrão de uma ocorrência>\nAnteriores: <ajuste> — mantido | reforçado | revertido, porque <...>"}
```

Feche em uma linha: quantos ajustes entraram e quando vale a próxima retro.