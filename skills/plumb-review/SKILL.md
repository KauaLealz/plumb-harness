---
name: plumb-review
description: Lê o diff (não roda nada) em dois eixos — fidelidade à spec (gaps faltando/parcial/contradiz/não pedido) e correção + convenções — com lente de segurança em área sensível, e só reporta: o usuário decide as correções. Use depois de construir, ou sozinho sobre um PR/branch de terceiro ("revisa o PR", "review", "audita essa branch", "olha esse código de fulano"). Reads the diff (runs nothing) on two axes — spec fidelity and correctness + conventions — with a security lens on sensitive areas; only reports, the user decides fixes.
---

# Plumb — review (ler o diff e julgar)

**No idioma do usuário.** Você **lê o diff** e julga; **não roda nada** (executar é o `plumb-qa`).
Entra com **contexto fresco**: julgue pelo que está escrito, não pelo que achava que ia ser feito.

Leia `playbook.md` (os dois eixos, a lente de segurança, a calibragem de severidade) uma vez. O
cérebro é opcional (`../plumb/references/knowledge-model.md`).

## Dois modos, uma skill

- **Passo do fluxo** — revisa o **próprio working diff** da mudança (depois do `plumb-code`/`qa`),
  contra a spec em `.plumb/work/<id>.md`.
- **Auditoria avulsa** — revisa um **PR/branch de terceiro** (gatilhos "revisa o PR", "audita essa
  branch"). Sem spec: o eixo A vira fidelidade à descrição do PR/card; fora do fluxo de mudança
  (não cria spec nem worktree).

## Princípios

- **Lê, não executa.** Você inspeciona o diff; prova executada é do `plumb-qa`.
- **Só reporta; o usuário decide todas as correções.** Nada auto-corrige — nem bloqueador.
- **Achado = cenário de falha concreto.** Um bug é "quando X com entrada Y, acontece Z", com
  `arquivo:linha` — não "isso pode dar problema".
- **Contexto fresco.** Despache um subagente que **não viu a conversa do build**
  (`../plumb/references/prompt-contract.md`), para julgar o código, não a intenção.

## Procedimento

0. **O que preciso saber (explorar → perguntar na dúvida).** Antes de julgar, explore:
   `.plumb/knowledge/preferences/review.md` (projeto + global) e as convenções do repo (as `rule` do
   projeto, padrões da base). O que isso já responde não vira pergunta. **Na dúvida, sempre pergunte**
   pela ferramenta de perguntas (recomendação primeiro) — em que focar, qual o limiar de severidade,
   onde ficam as convenções, que formato de veredito o dev quer. **Após cada resposta, passe pelo
   `plumb-learn`** (grava no projeto ou global, para não reinterrogar na próxima). Siga a preferência
   salva — precedência **projeto → global → playbook**. No trivial, não interrogue à toa: use o que
   explorou e o default. O mecanismo completo está em `../plumb/references/preferences.md`; as dimensões
   da 1ª vez, no `playbook.md`.
1. **Pegue o diff e a régua.** Working diff (`git diff`) ou PR/branch (`gh`, card). Leia a spec
   (resultados esperados + combinado) e as notas de `.plumb/knowledge/` da área que o diff toca.
2. **Veja a área.** Toca auth, pagamento, dado pessoal, segredo no diff ou entrada externa? →
   **ligue a lente de segurança** (o que olhar em cada uma está no `playbook.md`).
3. **Despache o revisor** com contexto fresco: o diff, a spec/descrição, as convenções que valem e,
   quando for o caso, a lente de segurança. Diff pequeno: revise você, com o mesmo rigor.
4. **Eixo A — fidelidade:** para cada resultado esperado, classifique o gap: `faltando` · `parcial`
   · `contradiz` · `não pedido`. **Eixo B — correção + convenções:** bugs reais e desvios das regras
   do projeto.
5. **Registre na spec** (seção `## Evidências`): o **veredito** e os achados por **severidade**
   (bloqueador · major · menor) — ex.: `review — reprovado · 1 bloqueador (A: resultado 2 contradiz),
   2 menores`.

## Override (dev/empresa)

Se o `.plumb/knowledge/` traz convenções, definição de pronto ou critérios de revisão da empresa,
eles **vencem** o default (precedência projeto → global → default do harness).

## Saída

Reporte ao usuário em poucas linhas: veredito + achados por severidade, bloqueador primeiro, cada um
com o cenário de falha e `arquivo:linha`; separe bug de preferência. **O usuário decide o que
corrigir.** Se for corrigir, volta ao `plumb-code`; **tudo ok → `plumb-learn`**.
