---
name: plumb-dream
description: O sonho do Plumb — vasculha as sessões recentes e as mudanças concluídas, extrai o que você corrigiu, repetiu ou recusou, audita a saúde do segundo cérebro (o que nunca foi usado, o que envelheceu, o que duplicou) e propõe ajustes e ferramentas que faltam, cada um com evidência e um sinal-alvo para a próxima medir. Use quando o orquestrador sugerir ou quando o usuário pedir.
disable-model-invocation: true
---

# Plumb dream

Enquanto você trabalha, o agente esquece. O sonho é onde o que aconteceu vira
o que fica: as correções que você repetiu, o comando que falhou duas vezes, a
preferência que você teve que dizer de novo, o acesso que faltou.

Melhore o harness a partir da **evidência do próprio trabalho**, nunca de
opinião. Cada ajuste nasce de um padrão observado e diz qual sinal deve
diminuir — é assim que o próximo sonho sabe se funcionou.

Fale como na seção Comunicação de `../plumb/SKILL.md`: idioma do usuário, uma
linha por etapa sobre o que você encontrou, sem ids internos nem keys do
cérebro no chat (diga o conteúdo do item).

## 1 — Coletar

**a) O registro do último sonho.** `item_get(keys=["dream/last"], repo=".")`:
a data e os ajustes aplicados, com seus sinais-alvo (`missing` = primeiro
sonho).

**b) As sessões desde então.** É a fonte que ninguém mais lê. Os transcripts
ficam em `~/.claude/projects/<caminho-do-repo-com-tracos>/*.jsonl`, um por
sessão. Eles são grandes (dezenas de MB) — **nunca leia o arquivo inteiro**.
Extraia só os turnos do usuário:

```bash
python3 - <<'EOF'
import json, pathlib, sys
# ajuste o caminho do projeto; mtime filtra por data do último sonho
for p in sorted(pathlib.Path.home().glob(".claude/projects/<slug>/*.jsonl")):
    for line in p.open():
        try: e = json.loads(line)
        except ValueError: continue
        if e.get("type") != "user" or e.get("toolUseResult") is not None: continue
        c = e.get("message", {}).get("content")
        t = c if isinstance(c, str) else "\n".join(
            b.get("text", "") for b in c if isinstance(b, dict) and b.get("type") == "text")
        t = t.strip()
        if t and not t.startswith(("<system-reminder", "[SYSTEM", "<task-notification", "<command-")):
            print("---", t[:600])
EOF
```

Numa sessão de 60 MB isso costuma devolver ~70 turnos. Procure:

| Sinal no que o usuário escreveu | O que costuma significar |
|---|---|
| "na verdade…", "não é isso", "eu disse…" | o agente decidiu errado — falta regra ou o item existente foi ignorado |
| a mesma instrução dita duas vezes em sessões diferentes | deveria ser um item do cérebro |
| "sempre…", "aqui a gente…", "prefiro…" que não viraram item | regra perdida |
| "o card diz…", "em produção dá…", "segue o Figma" sem o agente alcançar | **falta ferramenta** |
| retrabalho: pedir de novo o que já tinha sido entregue | critério de saída fraco, ou o testador não provou |

**c) As mudanças concluídas.** `knowledge-mcp recent --since <data> --json`
(Bash), filtrando `type: spec`; sem a data, `item_search(types=["spec"],
limit=20)`. Leia só a seção `## Retro` e os Números do `content`.

**d) Saúde do cérebro.** `item_search(types=["rule", "insight", "procedure",
"pattern", "knowledge"], limit=50)`. Cada resultado traz `uses`: quantas vezes
o item foi devolvido de propósito — a evidência de valor.

## 2 — Agrupar

- Junte por **causa raiz**, não por texto parecido. "Esqueceu a migration" em
  três mudanças é uma causa só.
- **Duas ou mais ocorrências** = padrão: candidato a ajuste.
- **Uma ocorrência** = observar: liste, não proponha.
- `uses` = 0 depois de 30 dias, ou contradito pelo trabalho → candidato a
  `deprecated` (ou a reforço, se devia ter sido usado e não foi). Dois itens
  dizendo o mesmo → juntar com `supersedes`.
- Para cada ajuste do sonho anterior: o sinal-alvo voltou? Não → manter. Menos
  → manter e observar. Igual ou mais → reforçar de outro jeito ou reverter.

## 3 — Propor

Despache `plumb-dreamer` **uma vez**, no modo auditoria, com os padrões, as
evidências (as falas do usuário e os ids das mudanças), os candidatos a
aposentar com o seu palpite, o resultado dos ajustes anteriores e o caminho
absoluto de `../plumb/references/brain-items.md`. Monte o prompt pelo contrato
em `../plumb/references/prompt-contract.md`.

Prefira sempre o ajuste mais barato que ataca a causa:

1. Reforçar um item que existe e foi ignorado (o porquê no `summary`, um
   exemplo, `keywords`, `scope_paths`).
2. Um item novo (`rule`, `gotcha`) ou uma linha nos comandos do `AGENTS.md`.
3. Um `procedure` para o que se repetiu.
4. **Uma ferramenta** — MCP (`plumb-find-mcps`) para falta de acesso, skill
   (`plumb-find-skills`) para falta de competência.

Limites fixos: nunca afrouxar regra de segurança ou de dados pessoais, nunca
remover um gate, no máximo 5 ajustes por sonho (aposentadorias não contam).
Problema cuja correção real é de arquitetura vira nota para o usuário, não
regra.

## 4 — Apresentar

```
**Plumb dream — 6 mudanças, 9 sessões (PAY-142 … fix-login)**

| Padrão | Evidência | Ajuste | Sinal-alvo |
|---|---|---|---|
| Migration esquecida antes dos testes | PAY-150, PAY-161, fix-ledger | `proc/run-migrations` com scope migrations/** | travamento por schema desatualizado |
| Erro de produção investigado por suposição | 2 sessões: "em produção dá 502" | MCP do Sentry (leitura) | investigação sem o erro real |

Aposentar: gotcha/cache-redis (contradito em PAY-161) · pattern/form-antigo (nunca usado em 45 dias).
Anteriores: "Money em pagamentos" — o sinal não voltou → manter.
Observar: 1 rejeição por texto de PR (fix-login).

Aplicar? (todos / 1,3 / só aposentar / nenhum)
```

## 5 — Aplicar e registrar

Grave só o aprovado, numa chamada: `item_save(repo=".", items=[...])` com os
itens novos ou reforçados (mesma `key`) e as aposentadorias (`{"key": ...,
"status": "deprecated"}`). Comandos vão para o `AGENTS.md`; ferramenta nova
entra também em `context/stack`.

No mesmo `item_save`, regrave o registro do sonho (substitui o anterior; o
histórico fica nos ajustes aplicados):

```json
{"key": "dream/last", "type": "spec", "status": "done",
 "title": "Sonho de <AAAA-MM-DD>", "summary": "<n> mudanças, <n> sessões, <n> ajustes",
 "content": "Mudanças: <keys>\nSessões lidas até: <data>\nAplicado: <item ou arquivo> — <ajuste> — alvo: <sinal que deve diminuir>\nFerramenta: <proposta e decisão>\nAposentados: <n>\nObservar: <padrão de uma ocorrência>\nAnteriores: <ajuste> — mantido | reforçado | revertido, porque <...>"}
```

Feche em uma linha: quantos ajustes entraram e quando vale o próximo sonho.
