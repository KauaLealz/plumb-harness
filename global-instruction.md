<!-- plumb:start -->
## Plumb

**Todo pedido passa pelo Plumb** — pergunta, regra enunciada, investigação, feature, bug,
refatoração, ticket, "continua de onde paramos", até a correção de uma linha. A cerimônia é
**proporcional ao score de complexidade** (1–10), mas o fluxo entra sempre. Um hook lembra disso a
cada mensagem.

**Não há orquestrador: você (o modelo) coordena por coreografia.** Classifique o pedido, carregue a
skill da situação, e cada skill aponta a próxima. A **spec é o estado** (o que foi feito, o que
falta).

| Situação | Skill |
|---|---|
| pergunta, explicação ou investigação | `plumb-ask` |
| mudança de código (feature, bug, refactor, migração, deploy, fila…) | roteie pelo score: direta → corrige; senão `plumb-grill` → `plumb-spec` → `plumb-code` → `plumb-qa` + `plumb-review` → `plumb-learn` → `plumb-ship` |
| planejar sem construir | `plumb-plan` (explore+grill+spec, para antes do código) |
| revisar código/PR | `plumb-review` |
| documentar (comportamento atual, para humanos) | `plumb-document` |
| preparar o repositório | `plumb-init` |
| regra/decisão ditada, ou fechar o aprendizado de uma mudança | `plumb-learn` |
| refletir sobre a sessão | `plumb-reflect` |
| falta doc de lib → `plumb-find-docs` · falta acesso a sistema → `plumb-find-mcps` · falta competência → `plumb-find-skills` (achar-ou-criar; só com o "sim") | |

**Triagem (score → trilha):** 1–2 direta (sem grill/spec: corrige, roda os checks, reporta) ·
3–5 padrão (fluxo completo) · 6–8 profunda (+design na spec, lente de segurança, EARS no crítico) ·
9–10 programa (+longa duração: feature_list, progresso, init.sh, E2E, waves). Sinais do score:
amplitude, risco (auth/pagamento/dado/contrato/migração/infra), incerteza, novidade, raio de
impacto, reversibilidade.

**Segundo cérebro — arquivos, estilo Obsidian, OPCIONAL (tudo funciona com e sem):**
- Lê e grava markdown livre (sem tipos fixos) em **duas camadas:** `.plumb/knowledge/` (do projeto,
  commitado) e `~/.plumb/knowledge/` (global/pessoal). O agente vê **global + projeto**.
- **Consulte antes de agir** (proporcional ao score) e **grave o que durar** no fecho. Regra ditada
  pelo usuário grava na hora (`plumb-learn`); o que você inferiu pede o "sim".
- Precedência de override: **projeto → global → default do harness**. As regras do dev/empresa
  **vencem** o default; o harness se adapta, não impõe.
- `knowledge-os` (MCP) é opcional — se instalado, acelera busca/UI; sem ele, lê os arquivos direto.

**A spec e o estado de execução são git/worktree-native**, nunca no cérebro: `.plumb/work/<id>.md`
na branch da mudança (some no merge). Coordenação e "continua o X": `git worktree list` + a spec na
branch + card. Com um gestor de tarefas (Jira/Linear/GitHub Issues): o card é o **quê + status**; o
`.plumb/knowledge` guarda o **porquê**.

**Disciplinas (toda situação):**
- **Pergunta ao usuário** → ferramenta de perguntas (opções clicáveis, recomendação primeiro); sem
  ela, lista numerada com a recomendação na opção 1. **Não infira o que muda o resultado: pergunte.**
- **Prova antes de "pronto":** no nível certo pela natureza (nunca só teste unitário); reporte a
  evidência. Push/PR/merge só com o "sim".
- **Paralelize** o trabalho independente (subagentes, fases/waves, buscas) por padrão.
- Cérebro/arquivo indisponível: avise em uma linha e siga.

Ao compactar a conversa, preserve o id da mudança ativa, as fases pendentes, as decisões e os
comandos que falharam.
<!-- plumb:end -->
