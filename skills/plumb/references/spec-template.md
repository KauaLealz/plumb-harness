# Modelo da spec da mudança

A spec mora no segundo cérebro, como item `spec`. Mantenha só as seções que a
trilha usa — seção vazia é ruído, não rigor. No idioma do usuário (títulos
inclusive).

```json
{"key": "change/pay-142", "type": "spec",
 "title": "PAY-142 — Pix no checkout",
 "summary": "Aguardando aprovação",
 "source": "PAY-142", "keywords": "pix qr code pagamento",
 "scope_paths": ["src/server.js", "test/payments.test.js"],
 "content": "<o markdown abaixo>"}
```

```markdown
# PAY-142: Pix no checkout
Trilha: padrão · Branch: <branch ou -> · Card: <link ou ->

## Objetivo
<1–3 frases: o problema e o resultado. Link do ticket, se houver.>

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
- [ ] 4. Aprender                          ·  dreamer                    ·  dep: 3
      sai quando: decisões e aprendizados gravados no cérebro

## Decisões
- <decisão> — <fonte: pedido, conversa, cérebro, AGENTS.md, código, ou ajuste do usuário em AAAA-MM-DD>

## Notas
<bloqueios, registros de travamento, problemas fora do escopo>

## Retro
- <tipo>: <o que aconteceu> — <evidência>
Números: <n> fases · <n> correções pós-revisão · <n> travamentos · <n> despachos · <n> consultas ao cérebro
```

## Regras dos campos

- **`summary`** — o andamento, em linguagem de resultado: `Aguardando
  aprovação`, `Construindo: fase 2 de 4 — falta recusar método inválido`,
  `Provando`, `Concluída: Pix devolve o QR code`. É o que aparece em "Mudanças
  em andamento" e o que uma sessão retomada lê primeiro. Atualize a cada
  avanço — só ele, numa chamada pequena (`{"key": "change/pay-142", "summary":
  "..."}`).
- **`content`** — reenvie só quando a spec muda (resposta que altera algo,
  escopo novo) e no fechamento, com as fases marcadas, a Retro e os Números.
- **`status`** — `active` enquanto está em andamento; `done` ao entregar (sai
  do pacote, continua na busca como histórico).

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
  pode ensinar algo.

### O resto

- **Decisões** — o "Decidi" da spec, cada uma com a fonte, mais os ajustes que
  o usuário fez na revisão. Só escolhas que alguém questionaria depois.
- **Retro** — sinais de retroalimentação (tipos em `retro-signals.md`), uma
  linha cada, anotados na hora. Os Números entram no fechamento; o
  `/plumb-dream` lê depois.
- **Notas** — o handoff. Se o trabalho parar no meio, uma sessão nova precisa
  continuar só com o `summary`, as fases desmarcadas e as Notas.
- **Card** — com um MCP de tarefas conectado, a spec **referencia** o card e
  não copia a descrição dele: lá vive o quê e o status; aqui, o como.
- Sem cérebro (fora do ar): a spec fica no chat e na lista de tarefas, e o item
  vai para a fila `~/.knowledge-os/pending.jsonl`.
