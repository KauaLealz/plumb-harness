---
name: plumb-change
description: Executa uma mudança de código no projeto — feature, projeto maior, bugfix, refatoração, hotfix, ticket ("implementa o PAY-142") ou "continua de onde paramos". Dimensiona a cerimônia (trilha direta para o pequeno e óbvio; padrão e profunda para o maior), alinha com um grill robusto antes de qualquer spec, trabalha num worktree próprio nas trilhas padrão/profunda, escreve os testes primeiro, prova o que fez e grava no segundo cérebro o que durar. Use para qualquer pedido que mude o código. Não use para responder uma pergunta, capturar uma diretriz, investigar sem mexer, planejar sem construir, revisar PR de terceiros, documentar, preparar o repositório ou refletir — cada um tem a sua skill.
disable-model-invocation: true
---

# Plumb — mudança

**Desde a primeira mensagem, no idioma do usuário.** Fale como um colega dev
contando o andamento — o que acontece com o código e o produto, nunca o método
(fases, trilhas, subagentes, esta skill são a sua engrenagem). Detalhes de tom em
`../plumb/references/communication.md`.

Você conduz uma mudança de código do começo ao fim: escolhe a trilha, alinha o que
será feito, constrói, prova e entrega. O usuário controla **o que será construído**
(alinha com você e aprova a spec) e **o que sai da máquina** (push, PR, merge). O
resto é seu, e você segue sem pedir licença. Você **não decide por ele** o que muda
o resultado: pergunta.

O segundo cérebro (MCP `knowledge-os`) entra em toda fase: antes de agir, consulte;
ao fechar, grave o que durar. O contrato está em `../plumb/references/brain.md`
(leia uma vez por sessão, antes da primeira gravação) — modelo v6: tipos `rule`,
`howto`, `context`, `work`, `secret` (sem subtipo; a nuance e o ciclo vão em
**tags**), alcance pela hierarquia, `links` unificado. A spec de uma mudança é um
item **`work`**, com a tag de ciclo (`draft` → `active` → `done`).

## 1 — Escolher a trilha

Olhe rápido o código envolvido antes ("causa óbvia" só se sabe olhando).

| Trilha | Quando | Como roda |
|---|---|---|
| **direta** | Óbvia e local: typo, config, bug de causa clara, ~1–2 arquivos, sem comportamento ou contrato novo | Sem spec, sem worktree (árvore principal). Só uma pergunta se o pedido for ambíguo. Você corrige, roda os checks e reporta. O pedido já é a aprovação |
| **padrão** | Todo o resto | **Todas as fases.** Alinhar (grill robusto), `work` da spec, aprovação antes do código, worktree próprio, entrega antes de push/PR |
| **profunda** | Capacidade nova entre módulos, migração de dados, API pública ou contrato, auth/pagamento/dados pessoais, ou 2+ soluções plausíveis | Todas, com Design na spec e lente de segurança no revisor |

A cerimônia **escala**: o pequeno não paga o fluxo inteiro; o grande, sim. Na
dúvida, a mais leve — se o escopo crescer, é bloqueio real: diga o que mudou em uma
linha e mostre a spec ajustada (replanejamento, abaixo).

**Bug, em qualquer trilha — o loop de diagnóstico:** (1) **reproduza** com um teste
que falha (ou um comando que mostra o erro); correção que você nunca viu falhar é
palpite; (2) **minimize** ao menor caso; (3) levante a **hipótese** da causa, não do
sintoma; (4) **instrumente** (log, asserção) para confirmar a causa antes de mudar;
(5) **corrija a causa**, não o sintoma; (6) deixe o teste do passo 1 como
**regressão**.

**Id da mudança:** o do ticket; senão um slug de 2–5 palavras (`corrige-expiracao-pix`).

## 2 — Entender

1. **Explorar (só leitura).** Área desconhecida: `plumb-explorer` com perguntas
   concretas (uma por explorador, até 3 em paralelo). Área pequena: leia você.
2. **Consultar o cérebro** uma vez: `item_search(repo=".", paths=<arquivos que a
   mudança toca>, query=<tema>)`. `howto` que casa vira o roteiro das fases; uma
   `rule` com a tag `security` na área, ou a área ser sensível (auth, pagamento,
   dado pessoal), liga a lente de segurança na prova.
3. **Checagem de ferramentas** (em todas as trilhas, antes de escrever código): a
   mudança usa biblioteca/SDK/config cuja API muda com a versão e que o código não
   mostra → `plumb-find-docs` e consulte, nunca pela memória; sistema citado sem
   acesso → `plumb-find-mcps`; competência que falta → `plumb-find-skills`. A
   recomendação vai ao usuário pela ferramenta de perguntas; nada se instala sem o
   "sim".

## 3 — Alinhar (grill robusto) — padrão e profunda

**Obrigatório, e leva a sério.** Leia `../plumb-align/SKILL.md` e entreviste o
usuário **antes** de especificar: todas as perguntas de uma vez (numa só chamada da
ferramenta de perguntas, até 4 por chamada), cada uma com a sua recomendação em
primeiro, cobrindo o que a exploração deixou em aberto, até haver entendimento
compartilhado.

- **Não infira o que muda o resultado: pergunta.** O que o código, o cérebro, o
  card ou a conversa já respondem não vira pergunta. Escolha de implementação é sua.
- **Só vira spec com entendimento compartilhado.** O resumo confirmado é o
  "Combinado" da spec.
- Specs ativas de outros (`work` com tag `active`) cujas áreas se sobrepõem: isso é
  uma pergunta do grill (sequenciar ou paralelizar).

## 4 — Especificar (padrão e profunda)

1. **Planejar.** `plumb-planner` com o pedido, o Combinado do grill, os achados da
   exploração, o que o cérebro trouxe, a trilha e (se toca API, banco, auth,
   pagamento, dados pessoais ou fluxo crítico) o caminho de `../plumb/references/testing.md`.
   Devolve a spec e, se algo ficou sem resposta, "Perguntas em aberto" — que viram a
   próxima rodada do grill, não uma suposição sua.
2. **Conferir:** cada resultado esperado tem o "observa-se"? Cada fase tem papel,
   dependência e critério de saída? Provar e Aprender estão lá? Fora de escopo
   explícito?
3. **Gravar** a spec como item **`work`** (`work/<id>`): tag `draft` + tag de área;
   `summary` e cabeçalho no padrão (`../plumb/references/spec-template.md`), no
   project da mudança. Apresente (formato no fim) e peça a aprovação pela ferramenta
   de perguntas.

**Depois da aprovação:** troque a tag `draft` por `active`, atualize o `summary`, e
**crie o worktree** (`../plumb/references/worktrees.md`: `.claude/worktrees/<id>`,
branch própria, dependências preparadas pela linha `Worktree:` do `AGENTS.md`);
grave Branch e Worktree no `work`. Sem git: sem worktree. Daqui até a entrega, não pare.

## 5 — Construir

Tudo roda **no worktree**. Antes da primeira fase, rode a suíte uma vez (falhas que
já existiam não são suas: anote e avise). Por **fase** (ou grupo que toca os mesmos
arquivos): despache `plumb-implementer` (contrato de prompt, caminho absoluto do
worktree, as regras do cérebro da área, o critério de saída e o comando); rode você
o critério da fase; marque a fase no `work` e commite no worktree se ligados; uma
linha de andamento. **Fases independentes rodam em paralelo** por padrão
(`../plumb/references/parallel.md`; regra `rule/parallelize-independent-work`).

- **Travou** (implementador `travado`, ou a mesma verificação falha duas vezes):
  `item_search` pelo sintoma antes de qualquer hipótese; sem saída, leve opções ao
  usuário.
- **Replanejar:** pedido **fora do que já foi planejado**, ou mudança nova → volta
  ao plano (delta proporcional: mudança pequena, um grill curto e ajuste da spec;
  grande, align completo), reaprova, e segue. Nada de embutir escopo novo sem
  replanejar.

## 6 — Provar

Evidência antes de afirmação: nunca "pronto" sobre o que não rodou nesta sessão.
Traga a base para a branch por merge e rode os testes de novo no worktree. Despache
**em paralelo**:
- `plumb-tester`: os resultados esperados da spec + os comandos e como subir a app.
  Prova que funciona; **não vê o diff**.
- `plumb-reviewer`: a key do `work` + base do diff. Com `rule` tag `security` na
  área (ou auth/pagamento/dados pessoais/entrada externa/segredo no diff) ou na
  trilha profunda, acrescente a lente de segurança.

Bloqueadores e majors: corrija já (sem perguntar; só decisão de produto vai ao
usuário). Menores ficam listados na entrega. Mudança visível e ferramenta de
navegador: exercite o fluxo você mesmo uma vez.

## 7 — Aprender (não se pula)

Você faz, inline (só você viu a conversa). Junte os candidatos (o que travou e
destravou, o que o usuário corrigiu ou repetiu, as decisões), teste cada um pelo
tipo (`brain.md`), anti-duplicata (`item_search` + mesma key atualiza), e grave: o
que o usuário ditou e a spec concluída gravam; o que você **inferiu** pede o "sim".
A spec vira `work` com tag `done`. `item` → `links` (`depends_on`/`relates_to`)
quando o leitor de um precisa do outro.

## 8 — Entregar

Apresente a entrega (formato no fim) com tudo fechado. **Rodada final, até estar
100%:** pergunte pela ferramenta se sobrou dúvida ou ajuste ("Está 100%" primeiro),
junto das confirmações do que você inferiu. Só então, numa chamada só, recomendação
primeiro: **o que sai da máquina** (push, PR com título e corpo, merge local, ou
deixar) e **limpar o worktree** (só com o "sim"). Direta ou sem git: sem rodada —
diga onde ficou e termine.

## Formatos (lidos em 10 segundos, sem ids internos)

**Spec (`work`):**
```
**Plano — Pix no checkout (PAY-142)**

O que vou entregar:
- `POST /payments` aceita `method: "pix"` e devolve um `qr_code`.
- Sem `method`, segue como cartão — quem já integra não percebe nada.
- Método desconhecido passa a dar erro 400 "método inválido".

Combinado com você:
- QR de exemplo, sem integração com o banco. Erro em português.

Como vou fazer: tudo em `src/server.js`, testes primeiro, worktree próprio, branch
`pay-142-pix`. Um revisor independente confere, com atenção à segurança (é pagamento).

Spec: http://127.0.0.1:8765/ui/#/c/...
```

**Entrega:**
```
**Pronto — Pix no checkout (PAY-142)**

O que funciona agora:
- Pagamento com Pix devolve o QR code ✓ teste + chamada real ao servidor
- Método desconhecido dá 400 "método inválido" ✓ teste + chamada real

Testes: 7 de 7 passando. Revisão independente: nenhum problema; apontou um risco que
já existia (corpo da requisição sem limite) — vale um card separado.

Guardei para as próximas vezes: como o Pix entra no contrato de pagamentos.
Está commitado na branch `pay-142-pix`, no worktree separado.
Spec: http://127.0.0.1:8765/ui/#/c/...
```
