---
name: plumb-spec
description: Transforma o "Combinado" do grill numa spec que o usuário aprova ANTES do build — resultados observáveis/falsificáveis, fases com dependência e critério de saída, modo design embutido quando o score é alto. Roda o spec-lint e o gate de aprovação. Use depois do grill, ou sozinho ("escreve a spec", "especifica isso", "/plumb-spec <tema>"). Turns the grill's agreement into a spec the user approves before building: observable/falsifiable results, phases with deps and exit criteria, embedded design mode when complex; runs spec-lint and the approval gate.
---

# Plumb — spec (escrever a spec antes do build)

**No idioma do usuário.** Você transforma o **Combinado** do grill numa **spec que o usuário aprova
ANTES de construir**. Não escreve código: a spec é o contrato que o `plumb-code` vai cumprir e o
roteiro que o `plumb-qa` vai provar (ele não vê o diff, prova pelo `observa-se:`).

Leia `playbook.md` (como especificar bem) uma vez. O template é
`../plumb/references/spec-template.md`; o cérebro é opcional (`../plumb/references/knowledge-model.md`).

## O que a spec é

- **Git/worktree-native:** arquivo `.plumb/work/<id>.md`, **commitado na branch**, removido/squashed
  antes do merge. **Nunca vai para o cérebro.** `<id>` = o do ticket, senão um slug de 2–5 palavras.
- **Também é o estado** da mudança: o cabeçalho (Estado/Atualizado) e os checkboxes são o
  acompanhamento; "continua o X" lê este arquivo.

## Princípios

- **Resultado observável e falsificável.** Cada resultado esperado traz `observa-se:` (o
  comando/chamada/tela que o demonstra). No crítico (auth, pagamento, dados, contrato), escreva **EARS**
  (`WHEN <evento> THE SYSTEM SHALL <resposta>`). Sem `observa-se:` verificável, o resultado está vago.
- **Fases com dependência e saída.** Cada fase declara `<arquivos> · dep: · sai quando:` (critério
  verificável). O **ciclo de vida entra como fase** (ex.: fase "migração" com critério de rollback),
  guiado pelo playbook da skill — nunca como seção separada. Independentes → **waves em paralelo**.
- **Modo design embutido** (score alto): compare 2+ abordagens, escolha uma com o porquê e registre a
  escolhida **em 1 linha no Objetivo**. **Não há seção Design.**
- **Fora de escopo explícito:** diga o que alguém suporia incluído e não está.

## Procedimento

1. **Puxe o Combinado** do grill e o score/sinais da triagem. Leia o `.plumb/knowledge/` das áreas que
   a mudança toca (proporcional ao score) — override da empresa vence o default.
2. **Escreva a spec** no template: cabeçalho (Score · Branch · Estado · Atualizado), Objetivo,
   Combinado, Fora de escopo, Resultados esperados (`[ ]` + `observa-se:` + EARS no crítico), Fases/waves
   (`[ ]` + arquivos + dep + sai quando), Evidências (vazia, cada agente anexa a sua), Notas/handoff.
3. **Design quando o score pede:** avalie 2+ abordagens, decida e condense a escolhida em 1 linha no
   Objetivo (o porquê curto; o descartado vira nota se útil).
4. **Rode o spec-lint** (`playbook.md`): reprova spec com resultado sem `observa-se:`, fase sem
   `sai quando:`, `[A DEFINIR]` pendente, ou (no crítico) resultado sem EARS. Conserte antes de seguir.
5. **Gate de aprovação:** apresente a spec pela ferramenta de perguntas (recomendação primeiro) e
   espere o **"sim"**. Replanejar sem aprovar: ajuste e reapresente.

## Override (dev/empresa)

Se o `.plumb/knowledge/` traz um **template de spec**, um formato de resultado ou uma definição de
pronto da empresa, ele **vence** o default (precedência projeto → global → default). Siga o deles.

## Saída

Aprovado → crie o **worktree** da mudança (ver `../plumb/references/worktrees.md`), escreva a spec na
branch e siga para **`plumb-code`**. Score 1–2 (trilha direta) não cria spec: corrige direto.
