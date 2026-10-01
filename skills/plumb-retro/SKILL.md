---
name: plumb-retro
description: Retrospectiva do Plumb — lê os sinais de retroalimentação das mudanças arquivadas desde a última retro, agrupa as causas que se repetem (travamentos, retrabalho, gates rejeitados, correções, lacunas de ferramenta, fatos velhos) e propõe ajustes pequenos em regras, skills, fatos e ferramentas, cada um com evidência e um sinal-alvo para medir se funcionou. Use quando o orquestrador sugerir (a cada 5 mudanças arquivadas) ou quando o usuário pedir uma retro.
disable-model-invocation: true
---

# Plumb retro

Melhore o harness deste projeto a partir da evidência do próprio trabalho,
nunca de opinião. Cada ajuste tem que nascer de um padrão observado e
dizer qual sinal deve diminuir — é assim que a próxima retro sabe se ele
funcionou.

Escreva no idioma do usuário e avise o progresso em uma linha por etapa.

## 1 — Coletar (barato)

1. Leia `.plumb/retro.md`, se existir: data da última retro e os ajustes
   aplicados nela, com seus sinais-alvo.
2. Liste as mudanças em `.plumb/changes/archive/` arquivadas depois disso.
   De cada uma, leia **só** o cabeçalho e a seção `## Retro` (Grep, não o
   arquivo inteiro) — é ali que os sinais já estão resumidos.
3. Se o usuário rodou `/insights` recentemente e colou o relatório, use-o
   como evidência adicional.

## 2 — Agrupar

- Junte os sinais por causa raiz, não por texto parecido. "Esqueceu de
  rodar a migration" em três mudanças diferentes é uma causa só.
- **Duas ou mais ocorrências** = padrão: candidato a ajuste.
- **Uma ocorrência** = observar: liste, não proponha.
- Para cada ajuste da retro anterior: o sinal-alvo voltou a aparecer?
  Não → manter. Sim, menos → manter e observar. Sim, igual ou mais →
  reforçar de outro jeito ou reverter.

## 3 — Propor

Despache `plumb-curator` **uma vez**, no modo diretriz, com todos os
padrões, as evidências (ids das mudanças e as linhas da Retro) e o
resultado dos ajustes anteriores. Monte o prompt pelo contrato em
`../plumb/references/prompt-contract.md`.

Prefira sempre o ajuste mais barato que ataca a causa:

1. Reforçar uma regra que existe e foi ignorada (acrescentar o porquê, um
   exemplo, ou escopo com `paths:`).
2. Uma linha nova numa regra ou no bloco de fatos.
3. Uma skill de projeto para um procedimento que se repetiu.
4. Uma ferramenta do catálogo — ou, se não houver, uma skill encontrada
   com `plumb-find-skills` — para uma lacuna que se repetiu.

Limites fixos: nunca afrouxar regra de segurança ou de dados pessoais,
nunca remover um gate, no máximo 5 ajustes por retro. Um problema cuja
correção real é de arquitetura vira uma nota para o usuário, não uma regra.

## 4 — Apresentar

```
**Plumb retro — 6 mudanças (PAY-142 … fix-login)**

| Padrão | Evidência | Ajuste | Sinal-alvo |
|---|---|---|---|
| Migration esquecida antes dos testes de integração | PAY-150, PAY-161, fix-ledger | Skill `rodar-migrations` com paths: migrations/** | `travamento` por schema desatualizado |

Ajustes anteriores: "Money em pagamentos" — o sinal não voltou → manter.
Observar: 1 rejeição por texto de PR (fix-login).

Aplicar? (todos / 1,3 / nenhum)
```

## 5 — Aplicar e registrar

Grave só o que foi aprovado. Depois acrescente ao fim de `.plumb/retro.md`:

```markdown
## <AAAA-MM-DD> — <n> mudanças (<ids>)
- Aplicado: <arquivo> — <ajuste> — alvo: <sinal que deve diminuir>
- Mantido / reforçado / revertido: <ajuste anterior> — <motivo>
- Observar: <padrão de uma ocorrência>
```

Feche em uma linha: quantos ajustes entraram e quando vale a próxima retro.