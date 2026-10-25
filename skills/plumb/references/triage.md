# Triagem e coreografia

Não há skill orquestradora. **Você (o modelo) coordena**, usando: a regra de roteamento (do hook), o
**score**, a **spec como estado**, e cada skill apontando a próxima.

## 1. Rotear

Classifique o pedido e carregue a skill (ver a tabela da instrução global). Pergunta/investigação →
`plumb-ask`. Documentar → `plumb-document`. Regra ditada → `plumb-learn`. Mudança de código → calcule
o score e siga a trilha abaixo.

## 2. Pontuar (score 1–10)

Depois de um `explore` rápido, some os sinais:

- **Amplitude** — nº de arquivos/módulos/áreas tocadas.
- **Risco** — auth, pagamento, dado pessoal, contrato público, migração de dados, infra de produção.
- **Incerteza** — quanto está em aberto / decisões não resolvidas.
- **Novidade** — greenfield ou área desconhecida.
- **Raio de impacto** — produção, entre serviços, assíncrono/filas.
- **Reversibilidade** — difícil de reverter (migração destrutiva, release amplo).

Grave o score e os sinais no cabeçalho da spec (auditável).

## 3. Trilha por banda

| Score | Trilha | Roda |
|---|---|---|
| 1–2 | **direta** | sem grill/spec: corrige, roda os checks, reporta. O `learn` ainda considera. |
| 3–5 | **padrão** | `grill` → `spec` (aprovação) → worktree → `plumb-code` (waves) → `qa` + `review` → `learn` → `ship` |
| 6–8 | **profunda** | + design na spec, lente de segurança no review, EARS no crítico, spec-lint estrito |
| 9–10 | **programa** | + longa duração: `feature_list.json` (passes:false→true), `claude-progress`, `init.sh`, verificação E2E, waves/múltiplos worktrees |

Na dúvida, a trilha mais leve; se o escopo crescer, **replaneje** (abaixo).

## 4. Sequenciar (a spec é o estado)

Cada passo, ao terminar, **atualiza a spec** (checkbox, evidência, Estado) e **aponta a próxima**.
Uma sessão nova lê a spec (`.plumb/work/<id>.md`) e sabe onde está. Fases independentes → **waves em
paralelo**.

## 5. Loop e replanejamento

- **Loop build↔prova:** `qa`/`review` reprovou ou achou gap → volta ao `plumb-code`; repete até
  limpo (clean state = mergeável).
- **Replanejar:** pedido **fora do que foi planejado**, ou mudança nova no meio → volta ao `grill`
  (delta proporcional ao tamanho), reaprova a spec, segue. Nunca embuta escopo novo sem replanejar.

## 6. Coordenação multi-agente (sem cérebro)

Vários worktrees na mesma base se enxergam por git: `git worktree list`, a spec na branch de cada
um, e `git diff --name-only` para ver sobreposição de áreas. Área sobreposta com outra spec ativa
vira pergunta do grill: sequenciar ou paralelizar.
