---
name: plumb-code
description: Implementa as fases/waves de uma spec — no worktree, mexendo só nos arquivos declarados, com teste primeiro por padrão (RED-GREEN-REFACTOR), commit atômico por fase e o acompanhamento da spec atualizado. Use depois de aprovar a spec, ou sozinho sobre uma spec existente ("implementa a fase 2 da spec X", "constrói isso", "codifica a fase"). Implements the phases/waves of a spec in the worktree, touching only the declared files, test-first by default, one atomic commit per phase, updating the spec's tracking.
---

# Plumb — code (construir)

**No idioma do usuário.** Você **implementa** as fases da spec: escreve o código que
faz os resultados esperados acontecerem, com a prova embutida. Não é prova final
(isso é `plumb-qa`) nem revisão (isso é `plumb-review`) — aqui você **constrói**.

Leia `playbook.md` (como construir bem + as fatias de ciclo de vida) uma vez. A spec
é `.plumb/work/<id>.md`; o worktree e o paralelismo seguem
`../plumb/references/{worktrees,parallel,prompt-contract}.md`. O cérebro é opcional
(`../plumb/references/knowledge-model.md`).

## Princípios

- **No worktree, só nos arquivos declarados.** Toda fase roda dentro do worktree da
  mudança (`.claude/worktrees/<id>`) e toca **só** os arquivos que a fase declara em
  `Fases / waves`. Precisou de outro arquivo → isso é escopo: pare e replaneje, não
  alargue por conta própria. Sem git: trabalhe na árvore principal e diga isso.
- **Teste primeiro por padrão (RED-GREEN-REFACTOR).** Escreva o teste que falha,
  veja-o falhar, faça passar com o mínimo, refatore. Onde o TDD unitário não cabe
  (UI, infra, migração, deploy), **o `playbook.md` define a prova** daquela fase
  (E2E, dry-run, rollback testado) — nunca "pronto" sem a prova da natureza.
- **Commit atômico por fase.** Cada fase vira um commit que compila e passa os
  checks dela. Nada de commit gigante no fim; nada de commit que não roda.
- **Atualize o acompanhamento.** Terminada a fase: marque o checkbox em
  `Fases / waves`, anote a evidência em `## Evidências` (`code (fase N) — <o que fez>
  · <commit/teste>`), e toque `Estado`/`Atualizado` no cabeçalho.

## Procedimento

1. **Leia a spec e o cérebro.** Pegue as fases desmarcadas, as dependências (`dep:`)
   e o `sai quando:` de cada uma; leia as notas de `.plumb/knowledge/` da área que a
   fase toca (resumo + caminho). Rode a suíte uma vez antes da primeira fase — falha
   que já existia não é sua: anote e avise.
2. **Monte as waves.** Fases com `dep:` satisfeito e arquivos **disjuntos** rodam em
   paralelo (ver `parallel.md`); as dependentes esperam. Em série quando há dependência
   real, não houver git, ou forem menos de 3 lotes.
3. **Implemente cada fase** (você ou, nas waves, um subagente implementador pelo
   contrato de `prompt-contract.md` com o caminho absoluto do worktree): teste primeiro
   (ou a prova que o `playbook.md` define para a natureza), código mínimo, refatore.
4. **Rode o `sai quando:`** da fase você mesmo. Passou → commit atômico, marque o
   checkbox, registre a evidência, uma linha de andamento. Falhou → conserte antes de
   seguir; a mesma verificação falha duas vezes → procure no `.plumb/knowledge` pelo
   sintoma (grep); sem saída, leve opções ao usuário.
5. **Integre as waves** uma por vez na branch da mudança, rodando a verificação do
   lote após cada integração (`parallel.md`).

## Override (dev/empresa)

Se o `.plumb/knowledge/` traz convenção de commit, estilo de código, estratégia de
migração/deploy ou critério de pronto da empresa, ele **vence** o default
(precedência projeto → global → default). Siga o deles.

## Saída

Reporte em linguagem de produto, com o que já roda e onde ficou commitado: `✓ Fase 2
— webhook recusa Pix vencido · teste de regressão + commit a1b2c3`. **Concluídas as
fases, aponte a prova e a revisão:** `plumb-qa` (prova cada resultado esperado) +
`plumb-review` (lê o diff). Se o qa ou o review reprovar com bug real, o loop **volta
para cá** para a correção.
