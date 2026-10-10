# Modelo da spec da mudança

A spec mora no segundo cérebro, como item `spec`. Mantenha só as seções que a
trilha usa — seção vazia é ruído, não rigor. No idioma do usuário (títulos
inclusive).

```json
{"key": "spec/pay-142", "type": "spec", "status": "draft", "origin": "agent",
 "title": "PAY-142 — Pix no checkout",
 "summary": "Aguardando aprovação · fase 0/4 · pay-142-pix · sem worktree · Claude (sessão 4f2a)",
 "tags": ["aguardando-aprovacao", "pagamentos"],
 "source": "PAY-142", "keywords": "pix qr code pagamento",
 "links": [{"title": "Card PAY-142", "url": "<link, se houver>"}],
 "scope_paths": ["src/server.js", "test/payments.test.js"],
 "content": "<o markdown abaixo>"}
```

```markdown
# PAY-142: Pix no checkout
Trilha: padrão
Agente: <agente> · sessão <id curto>
Base: <branch de onde parte>
Branch: <branch da mudança ou —>
Worktree: <.claude/worktrees/<id> ou —>
Atualizado: AAAA-MM-DD HH:MM
Card: <link ou —>

## Objetivo
<1–3 frases: o problema e o resultado. Link do ticket, se houver.>

## Combinado
<!-- o entendimento confirmado no grill: uma linha por decisão, com o porquê -->
- <decisão do usuário> — <porquê, em meia frase>

## Fora de escopo
- <o que alguém poderia supor incluído, mas não está>

## Resultados esperados
1. <comportamento, em linguagem de produto>
   observa-se: <o comando, a chamada ou a tela que demonstra>
2. <...>
   observa-se: <...>

## Design
<!-- só na trilha profunda -->
Opções: A — <...> · B — <...> → escolhida: A, porque <...>
Contratos / dados / migração: <o que muda, ou "n/a">
Riscos e rollback: <...>

## Fases
- [ ] 1. <nome em linguagem de resultado>  ·  implementer  ·  <arquivos>  ·  dep: —
      sai quando: <critério verificável>
- [ ] 2. <...>                             ·  implementer  ·  <arquivos>  ·  dep: 1
      sai quando: <...>
- [ ] 3. Provar                            ·  tester ∥ reviewer          ·  dep: 1,2
      sai quando: cada resultado esperado com evidência executada, sem bloqueador
- [ ] 4. Aprender                          ·  orquestrador               ·  dep: 3
      sai quando: decisões e aprendizados gravados no cérebro, feedback dado

## Notas
<bloqueios, registros de travamento, problemas fora do escopo>

## Retro
- <tipo>: <o que aconteceu> — <evidência>
Números: <n> fases · <n> correções pós-revisão · <n> travamentos · <n> despachos · <n> consultas ao cérebro
```

## Regras dos campos

- **`status`** — `draft` enquanto aguarda aprovação; `active` depois do "sim", em
  andamento; `done` ao entregar (sai do pacote, continua na busca como histórico).
- **`origin`** — `agent` (você a redigiu); a spec que o usuário ditou por inteiro
  é rara.
- **`summary`** — linha fixa `<estado> · <fase n/total> · <branch> · <worktree> ·
  <agente>`; estados: `Aguardando aprovação`, `Construindo`, `Provando`,
  `Parada`, `Concluída` (`Concluída: Pix devolve o QR code`). É o que as outras
  sessões veem nas specs ativas e o que uma sessão retomada lê primeiro.
  Atualize a cada fase, junto da tag de estado e de `Atualizado`, na regravação
  que já faz (chamada pequena: `{"key": "spec/pay-142", "summary": "...", "tags": [...]}`).
- **`tags`** — estado (`aguardando-aprovacao` com `draft`, `em-andamento` com
  `active`, `parada`) + 1 a 3 de área ou tema (de `tag_list`) + `worktree` quando
  houver. Ao concluir saem as de estado e `worktree`. Padrão completo: `brain.md` §15.
- **`scope_paths`** — as áreas que a mudança toca: é o que revela sobreposição
  com a spec de outro agente.
- **Link** — o `url` que o servidor devolve; toda mensagem ao usuário sobre a
  spec (criada, atualizada, entregue) termina com `Spec: <url>`.
- **`content`** — reenvie só quando a spec muda (resposta que altera algo,
  escopo novo) e no fechamento, com as fases marcadas, a Retro e os Números.
- **`scope`** — omita: a spec é do project (`scoped`).

### Resultados esperados

Cada um traz **como se observa que funcionou**. Não é enfeite: é o roteiro do
testador, que trabalha sem ver o diff e não vai inventar como testar.

- ✅ `Pix vencido é recusado` / `observa-se: POST /webhook com Pix criado há 31
  min retorna 422 com motivo "expired"`
- ❌ `Trata erros adequadamente` — não dá para observar, logo não dá para
  provar.

Se você não consegue escrever o "observa-se", o resultado está vago demais.

### Fases

Cada fase diz **qual papel** a executa, **de que fase depende** e **como se
sabe que terminou**.

- **Papel, não quantidade:** `implementer`, nunca "3 implementers" — quantos
  despachar é decisão de execução, na hora.
- **Uma fase = um contexto suficiente.** Se executá-la exige saber de meio
  repositório, quebre. Se duas tocam os mesmos arquivos, junte: um despacho,
  um commit.
- **`dep:`** é o que destrava o paralelo (fases sem dependência pendente vão
  juntas) e o que responde "qual a próxima" depois de uma compactação, sem
  reler a spec inteira.
- **`sai quando:`** verificável — um comando, um teste, um estado observável.
  Nunca "está pronto".
- **Provar e Aprender são do molde**, não se inventam nem se removem. Na
  trilha direta a fase Provar pode sair; **Aprender nunca sai** — até um typo
  pode ensinar algo. Aprender é do orquestrador, não de um subagente.

### O resto

- **Combinado** — o que o usuário definiu no grill e na aprovação, cada item
  com o porquê e a data quando for um ajuste posterior. "Decide você" também é
  um combinado, registrado como tal e só para esta mudança. Nada entra aqui que
  o usuário não tenha dito ou confirmado.
- **Retro** — sinais de retroalimentação (tipos em `retro-signals.md`), uma
  linha cada, anotados na hora. Os Números entram no fechamento; o
  `/plumb-dream` lê depois.
- **Notas** — o handoff. Se o trabalho parar no meio, uma sessão nova precisa
  continuar só com o `summary`, as fases desmarcadas e as Notas.
- **Card** — a sétima linha do cabeçalho, opcional (as outras seis são fixas); com um MCP de tarefas conectado, a spec **referencia** o card (em
  `links`) e não copia a descrição dele: lá vive o quê e o status; aqui, o como.
- Sem cérebro (fora do ar): a spec fica no chat e na lista de tarefas, e o item
  vai para a fila `~/.knowledge-os/pending.jsonl`.
