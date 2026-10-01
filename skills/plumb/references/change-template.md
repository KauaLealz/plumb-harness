# Modelo do arquivo da mudança

Grave em `.plumb/changes/<id>.md`. Mantenha só as seções que a trilha usa —
seção vazia é ruído, não rigor. Escreva no idioma do usuário (títulos
inclusive).

```markdown
# <id>: <título curto>
Status: aguardando aprovação · Trilha: padrão · Branch: <branch ou ->

## Objetivo
<1–3 frases: o problema e o resultado observável. Link do ticket, se houver.>

## Fora de escopo
- <o que alguém poderia supor incluído, mas não está>

## Critérios de aceite
- AC1: Dado <estado>, quando <ação>, então <resultado observável>.
- AC2: ...

## Design
<!-- só na trilha profunda -->
Opções: A — <...> · B — <...> → escolhida: A, porque <...>
Contratos / dados / migração: <o que muda, ou "n/a">
Riscos e rollback: <...>

## Tasks
- [ ] T1 <o quê> — arquivos: <caminhos> — prova: AC1 — verificar: `<comando>`
- [ ] T2 <o quê> — arquivos: <caminhos> — prova: AC2 — verificar: `<comando>`

## Decisões
- <AAAA-MM-DD> <quem>: <decisão> — <porquê>

## Notas
<bloqueios, registros da regra do travamento, problemas fora do escopo>

## Retro
- <tipo>: <o que aconteceu> — <evidência>
Números: <n> tasks · <n> T-fix · <n> travamentos · <n> gates rejeitados
```

## Regras dos campos

- **Status** — `aguardando aprovação`, `construindo T<n>`, `verificando`,
  `pronta para entregar` ou `concluída`. É a primeira coisa que uma sessão
  retomada lê; atualize sempre que o trabalho andar.
- **Critérios de aceite** — cada um provável por um teste ou comando.
  "Trata erros adequadamente" não é provável; "Dado um Pix criado há 31
  minutos, quando o webhook confirmar, então ele é recusado com motivo
  `expired`" é.
- **Tasks** — uma task = um commit revisável. Task que mistura dois
  critérios ou mexe em arquivos sem relação está grande demais: divida.
  `verificar` é o comando mais estreito que prova a task (em geral um
  arquivo de teste), não a suíte inteira.
- **Decisões** — só escolhas que alguém questionaria depois, já tomadas:
  as respostas do usuário nos gates e o que ele aprovou. Uma sugestão sua
  ainda em aberto fica nas Perguntas do gate, não aqui.
- **Retro** — sinais de retroalimentação (tipos na skill `plumb`), uma
  linha cada, anotados na hora. A linha de Números entra no fechamento. É o
  que a `/plumb-retro` lê depois.
- **Notas** — o handoff. Se o trabalho parar no meio, uma sessão nova
  precisa continuar só com Status, tasks desmarcadas e Notas.