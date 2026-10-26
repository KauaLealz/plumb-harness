# Playbook do spec — como especificar bem

A expertise do `plumb-spec`: o que faz uma spec ser **aprovável e provável** (pelo `plumb-qa`, que não
vê o diff). É o que o `spec` lê para escrever bem e para rodar o spec-lint.

## O que preciso saber (1ª vez)

Antes de especificar, explore o que o dev/time já definiu (`.plumb/knowledge/preferences/spec.md` e o
template da empresa) e, **na dúvida, pergunte** — cada resposta passa pelo `plumb-learn`, para na
próxima a skill já saber. Dimensões que costumam travar uma spec boa:

- **Formato/seções** — como o dev/time quer a spec: as seções do template, a ordem, o que entra no
  cabeçalho. Quando a empresa tem **template de spec próprio**, ele manda. → tende a **projeto** (o
  template é do time); o gosto de layout pessoal é **global**.
- **Nível de detalhe** — spec enxuta (só resultados + fases) ou densa (cada resultado destrinchado,
  casos de borda listados). → tende a **global** (preferência pessoal de formato).
- **Critérios de aceite: EARS vs linguagem simples** — o time exige EARS (`WHEN … SHALL …`) em tudo, só
  no crítico (default), ou prefere linguagem simples falsificável em todo lugar. → **projeto** se é
  convenção do time; **global** se é gosto do dev.
- **De onde vêm os critérios** — o card/ticket já traz os critérios de aceite a copiar, ou se escreve do
  zero a partir do Combinado? (Qual sistema: Jira, Linear, GitHub Issues.) → **projeto**.
- **Template de spec da empresa** — existe um arquivo/modelo oficial a seguir em vez do default? → é a
  fonte que **vence** o playbook; nota de **projeto**.

No trivial, não interrogue à toa: use o que explorou e o default, e pergunte só o que de fato muda o
entregável. Detalhe do mecanismo em `../plumb/references/preferences.md`.

## Resultado observável e falsificável

O coração da spec são os **resultados esperados**. Um bom resultado:

- Está em **linguagem de produto** (o que o usuário/sistema passa a fazer), não de implementação.
- Traz `observa-se:` — o **roteiro concreto** de como se demonstra: o comando e a saída esperada, a
  chamada real, a tela. É o que o `qa` vai executar; se você não consegue escrever o `observa-se:`, o
  resultado ainda está vago.
- É **falsificável:** dá para dizer sem ambiguidade se passou ou falhou. "Melhora a performance" é
  ruim; "a listagem responde em < 300 ms com 10k linhas, medido por `ab -n 100`" é bom.
- Um resultado = um comportamento. Se o `observa-se:` precisa de "e também…", quebre em dois.

### EARS no crítico

Em área sensível (auth, pagamento, dados pessoais, contrato público, migração) escreva o resultado em
**EARS**, que torna o gatilho e a resposta inequívocos:

- Ubíquo: `THE SYSTEM SHALL <resposta>`.
- Evento: `WHEN <evento> THE SYSTEM SHALL <resposta>`.
- Estado: `WHILE <estado> THE SYSTEM SHALL <resposta>`.
- Condição: `IF <condição inesperada> THEN THE SYSTEM SHALL <resposta>`.
- Opcional: `WHERE <feature presente> THE SYSTEM SHALL <resposta>`.

Cubra o caminho **feliz e o de falha** (o estorno que falha, o acesso negado) — é onde o bug mora.

## Fases: quando quebrar, quando juntar

Uma fase é uma unidade que **fecha sozinha** (commit atômico, critério de saída verificável). Cada uma:
`<nome> · <arquivos> · dep: · sai quando:`.

- **`sai quando:`** é um critério **verificável**, não "feito": "`npm test` verde e a rota responde
  201", não "implementar o endpoint".
- **`dep:`** nomeia a(s) fase(s) que a destravam. Sem dep entre duas fases → elas são **independentes**.
- **`<arquivos>`** delimita o que a fase toca: é o contrato que o `plumb-code` respeita (só os arquivos
  declarados) e o que evita colisão entre waves.

**Quebre** uma fase quando: toca áreas/arquivos disjuntos que poderiam rodar em paralelo; tem uma parte
arriscada que merece prova própria antes de seguir; ou o `sai quando:` vira uma lista de "e também".
**Junte** quando: duas "fases" compartilham os mesmos arquivos e uma não prova nada sem a outra —
separá-las só cria dependência serial sem ganho.

### Waves (paralelismo)

Fases **sem dependência entre si** formam uma **wave**: rodam em paralelo (worktrees filhos, via
`plumb-code`). Desenhe para maximizar waves — áreas disjuntas, arquivos que não se sobrepõem. Fases com
`dep:` entram na wave seguinte. Em programa (score 9–10), waves largas + `feature_list.json`.

## Ciclo de vida como fase (não como seção)

A spec v7 **não tem** seção de Design nem de Ciclo de vida. O que o ciclo de vida exige vira **fase**,
guiada pelo playbook da skill que a executa:

- **Migração de dados:** fase "migração" com `sai quando:` cobrindo **up, down (rollback) e dados
  existentes** em banco de teste (casa com o piso do `plumb-qa`).
- **Feature flag / rollout:** fase com os dois estados (ligada/desligada) no `sai quando:`.
- **Contrato/API pública:** fase de contrato com `sai quando:` = compatibilidade verificada (quebra →
  versionar).
- **Observabilidade/infra:** fase com smoke/validação de IaC no `sai quando:`.

Assim o rollback, o versionamento e o rollout têm **lugar, dependência e prova** — em vez de virarem
texto solto que ninguém executa.

## Modo design embutido (score alto)

Quando o score é alto e há mais de um caminho razoável:

1. Liste **2+ abordagens** com o trade-off de cada (custo, risco, reversibilidade, encaixe no que já
   existe).
2. **Escolha uma** e diga **por quê** a escolhida vence as outras.
3. Condense a decisão em **1 linha no Objetivo** ("Abordagem: fila com idempotência por chave, não cron
   — evita corrida e dá retry barato"). O descartado, se útil, vira uma linha em Notas.

Não crie seção Design: a spec carrega a **decisão**, não a deliberação.

## O spec-lint em detalhe

Gate antes do build. **Reprova** a spec que tiver:

- **Resultado esperado sem `observa-se:`** — ou com um `observa-se:` não verificável ("funciona bem").
- **Fase sem `sai quando:`** — ou com um `sai quando:` que é só "feito/implementado", não um critério.
- **Marcador `[A DEFINIR]` pendente** — qualquer buraco não resolvido no corpo.
- **(No crítico) resultado sem EARS** onde a área exige (auth/pagamento/dados/contrato/migração).

Checagens de bom-senso que também valem a reprova: resultado escrito como tarefa de implementação (e
não como comportamento); fase cujos `<arquivos>` estão vazios; `dep:` apontando para fase inexistente;
Objetivo sem a abordagem escolhida quando houve design. Conserte e só então abra o gate de aprovação.

## Pegadinhas

- Não encha o Combinado de inferência: ele é o que o **usuário** decidiu no grill. Dúvida nova que
  mude o resultado → volta ao grill (replanejamento), não "chuta na spec".
- `observa-se:` não é "passa o teste unitário": é o comportamento no nível certo (o `qa` tem piso por
  natureza). Escreva o que se **observa**, não o teste que você imagina.
- Spec grande demais costuma ser mudança grande demais: se as fases não cabem em waves claras,
  reconsidere o escopo com o usuário antes de aprovar.
- A spec some no merge (squash). Conhecimento durável (decisão de arquitetura, pegadinha) é do
  `plumb-learn` → `.plumb/knowledge/`, não da spec.
