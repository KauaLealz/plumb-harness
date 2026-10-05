# Modelo do plano da mudança

O plano mora no segundo cérebro, como item `task`. Mantenha só as seções que a
trilha usa — seção vazia é ruído, não rigor. No idioma do usuário (títulos
inclusive).

```json
{"key": "mudanca/pay-142", "type": "task", "memory_class": "working",
 "title": "PAY-142 — Pix no checkout",
 "summary": "Aguardando aprovação",
 "source": "PAY-142", "keywords": "pix qr code pagamento",
 "scope_paths": ["src/server.js", "test/payments.test.js"],
 "content": "<o markdown abaixo>"}
```

```markdown
# PAY-142: Pix no checkout
Trilha: padrão · Branch: <branch ou ->

## Objetivo
<1–3 frases: o problema e o resultado observável. Link do ticket, se houver.>

## Fora de escopo
- <o que alguém poderia supor incluído, mas não está>

## Critérios de aceite
- AC1: Dado <estado>, quando <ação>, então <resultado observável>.

## Design
<!-- só na trilha profunda -->
Opções: A — <...> · B — <...> → escolhida: A, porque <...>
Contratos / dados / migração: <o que muda, ou "n/a">
Riscos e rollback: <...>

## Tarefas
Lote L1 (arquivos: <caminhos>) — verificar: `<comando do lote>`
- [ ] T1 <resultado em linguagem de comportamento> — prova: AC1
- [ ] T2 <...> — prova: AC2

## Decisões
- <decisão> — <fonte: pedido, conversa, cérebro, AGENTS.md, código, ou ajuste do usuário em AAAA-MM-DD>

## Notas
<bloqueios, registros de travamento, problemas fora do escopo>

## Retro
- <tipo>: <o que aconteceu> — <evidência>
Números: <n> tarefas · <n> lotes · <n> correções pós-revisão · <n> travamentos · <n> despachos · <n> consultas ao cérebro
```

## Regras dos campos

- **`summary`** — o andamento, em linguagem de resultado: `Aguardando aprovação`,
  `Construindo: 1 de 2 — falta recusar método inválido`, `Verificando`,
  `Concluída: Pix devolve o QR code`. É o que aparece em "Mudanças em andamento" e
  o que uma sessão retomada lê primeiro. Atualize a cada avanço — só ele, numa
  chamada pequena (`{"key": "mudanca/pay-142", "summary": "..."}`).
- **`content`** — reenvie só quando o plano muda (respostas que alteram algo,
  escopo novo) e no fechamento, com as tarefas marcadas, a Retro e os Números.
- **`status`** — `active` enquanto está em andamento; `done` ao entregar (sai do
  pacote, continua na busca como histórico).
- **Critérios de aceite** — cada um provável por um teste ou comando. "Trata erros
  adequadamente" não é provável; "Dado um Pix criado há 31 minutos, quando o webhook
  confirmar, então ele é recusado com motivo `expired`" é.
- **Tarefas** — uma tarefa prova um critério. **Lote** = tarefas que tocam os mesmos
  arquivos: um despacho, um commit. A descrição de cada tarefa é o texto que o
  usuário vê na lista de tarefas: escreva como resultado, não como implementação.
- **Decisões** — o "Decidi" do plano, cada uma com a fonte, mais os ajustes que o
  usuário fez na revisão. Só escolhas que alguém questionaria depois.
- **Retro** — sinais de retroalimentação (tipos em `retro-signals.md`), uma linha
  cada, anotados na hora. Os Números entram no fechamento; a `/plumb-retro` lê depois.
- **Notas** — o handoff. Se o trabalho parar no meio, uma sessão nova precisa
  continuar só com o `summary`, as tarefas desmarcadas e as Notas.
- Sem cérebro (fora do ar): o plano fica no chat e na lista de tarefas, e o item vai
  para a fila `~/.knowledge-os/pending.jsonl`.
