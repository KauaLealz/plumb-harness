# Molde de item do cérebro

Para gravar você mesmo uma regra, decisão ou gotcha simples (sem despachar o
curador). Padrões novos, procedimentos e lotes com 3 sinais ou mais vão ao
`plumb-curator`.

```json
{"key": "regra/money", "type": "rule",
 "title": "Money em pagamentos",
 "summary": "Valores sempre em centavos inteiros (Money, em shared/money) — float perde centavos em somas.",
 "content": "Exemplo: 1990 = R$ 19,90. Exceção: relatórios, que formatam só na borda.",
 "scope_paths": ["src/payments/**"], "keywords": "dinheiro valor centavos preço",
 "source": "PAY-142"}
```

Grave com `item_save(project=".", items=[...])`. Resposta `action: unchanged`
= já existia igual; `similar` = título parecido já guardado (releia antes de
duplicar).

## Antes de gravar: é conhecimento, e é deste projeto?

| Se é… | Não é item do projeto. Vai para… |
|---|---|
| Bug, dívida, "candidato a correção" | Um card/ticket ou uma mudança. Bug é trabalho, não fato |
| Andamento: "ainda falta X", "corrigido na branch Y", "restavam 3" | O plano da mudança (`mudanca/<id>`), que termina como `done` |
| Medição datada (contagem de testes, erros de lint de hoje) | Notas do plano; no máximo um `ephemeral` com `ttl_days` |
| Problema do ambiente da máquina ou da sessão do agente (sandbox, antivírus, SO) | Workspace `Global` (é seu, não do código) |
| Conhecimento geral de ferramenta (git, npm, Maven) que vale em qualquer repositório | Workspace `Global` |
| Como o Plumb, o cérebro ou o harness funcionam | Nada — isso já está nas instruções |
| O que o código ou o `AGENTS.md` mostram em segundos | Nada |

## Campos

| Campo | Regra |
|---|---|
| `key` | Estável, minúscula, prefixo do tipo: `regra/`, `decisao/`, `proc/`, `padrao/`, `gotcha/`, `contexto/`. Mesma key = atualiza, não duplica |
| `type` | `rule` sempre/nunca · `insight` decisão do time e o porquê · `procedure` passo a passo repetível · `pattern` solução recorrente com o arquivo-modelo · `knowledge` armadilha ou comportamento não óbvio **do código deste projeto** · `context` o que o projeto é (produto, domínio, mapa) |
| `summary` | 1–2 frases no imperativo, **com o porquê**. É o que aparece no pacote; se precisa do `content` para ser seguido, está fraco |
| `content` | Exemplo, exceção, passos com os comandos exatos |
| `scope_paths` | Os arquivos onde a regra **de fato** se aplica, o mais estreito possível. Sem escopo = aparece em toda sessão; escopo largo (`frontend/**`) = entra "em foco", com conteúdo, em quase toda mudança — use só para o que vale mesmo para tudo ali |
| `keywords` | 4–8 sinônimos em português, separados por espaço, que alguém usaria para buscar. Não repita o título |
| `sensivel` (em `keywords`) | **Só** para autenticação/autorização, pagamento, dados pessoais, isolamento entre tenants e segredos. Liga a revisão de segurança — marcar demais a banaliza |
| `source` | De onde veio, num formato só: `commit abc1234`, `<id-da-mudança>` ou `pedido do usuário AAAA-MM-DD`. Nunca um arquivo que deixou de existir |
| `relations` | `[{"type": "supersedes", "target": "<key antiga>"}]`; outros tipos: `related_to`, `depends_on`, `implements`, `references`, `derived_from` |

## O que apodrece (não escreva)

| Errado | Certo |
|---|---|
| "registre em SecurityConfig.java (linhas 69-92)" | "registre em `SecurityConfig.securityFilterChain`, nos matchers de `/public/**`" — classe, método ou símbolo, nunca número de linha |
| "commit (T-17, synapse-redesign)", ".plumb/work/…/state.md" | `source: "commit b68df55e"` — ids de tarefa e arquivos do harness não existem depois |
| "Ainda restavam em 2026-10-05: A.java e B.yml" | Só a regra: "ao mexer numa área, `grep` pelo pacote antigo e aponte para o atual" |
| "Baseline: 229 erros de lint, 56 testes" | Nada (ou `ephemeral` com `ttl_days: 7`) |
| "Bug: o front faz POST duplo… candidato a correção" | Um card. No cérebro, só se virar uma regra ("efeito que cria recurso precisa de guarda contra execução dupla") |

## Não guarde

Segredo, credencial, URL com senha, dado pessoal (o servidor recusa, mas não
tente). Decisão que vale só para uma mudança (fica nas Decisões dela).

## Cérebro fora do ar

Uma entrada por linha em `~/.knowledge-os/pending.jsonl`: o mesmo objeto de
`items` mais `"project": "<caminho absoluto do repositório>"`. A próxima sessão
grava sozinha (o hook do início esvazia a fila).
