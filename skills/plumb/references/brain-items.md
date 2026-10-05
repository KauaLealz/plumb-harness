# Molde de item do cérebro

Para gravar você mesmo uma regra, decisão ou gotcha simples (sem despachar o
curador). Padrões novos, procedimentos e lotes com 3 sinais ou mais vão ao
`plumb-curator`.

```json
{"key": "regra/money", "type": "rule", "memory_class": "working",
 "title": "Money em pagamentos",
 "summary": "Valores sempre em centavos inteiros (src/shared/money.js) — float perde centavos em somas.",
 "content": "Exemplo: 1990 = R$ 19,90. Exceção: relatórios, que formatam só na borda.",
 "scope_paths": ["src/payments/**"], "keywords": "dinheiro valor centavos",
 "source": "PAY-142"}
```

Grave com `item_save(project=".", items=[...])`. Resposta `action: unchanged`
= já existia igual; `similar` = título parecido já guardado (releia antes de
duplicar).

## Campos

| Campo | Regra |
|---|---|
| `key` | Estável, minúscula, prefixo do tipo: `regra/`, `decisao/`, `proc/`, `padrao/`, `gotcha/`, `contexto/`. Mesma key = atualiza, não duplica |
| `type` | `rule` sempre/nunca · `insight` decisão e porquê · `procedure` passo a passo · `pattern` solução recorrente com o arquivo-modelo · `knowledge` fato ou armadilha · `context` pano de fundo |
| `summary` | 1–2 frases no imperativo, **com o porquê**. É o que aparece no pacote; se precisa do `content` para ser seguido, está fraco |
| `content` | Exemplo, exceção, passos com os comandos exatos |
| `scope_paths` | Globs a partir da raiz; sem eles a regra aparece em toda sessão. Na dúvida, escopo |
| `keywords` | Sinônimos que alguém usaria para buscar. A palavra `sensivel` marca área de risco (pagamento, auth, dados pessoais) e liga a revisão de segurança |
| `memory_class` | Sempre `working`. `longterm`/`canonical` só com o "sim" do usuário |
| `source` | Id da mudança ou commit |
| `relations` | `[{"type": "supersedes", "target": "<key antiga>"}]`; outros tipos: `related_to`, `depends_on`, `implements`, `references`, `derived_from` |

## Não guarde

Segredo, credencial, URL com senha, dado pessoal (o servidor recusa, mas não
tente). O que o código ou o `AGENTS.md` já mostram. Decisão que vale só para
uma mudança (fica nas Decisões dela). Bug ou dívida (é trabalho, não fato).

## Cérebro fora do ar

Uma entrada por linha em `.plumb/pending-brain.jsonl` (o mesmo objeto de
`items`, com `workspace` e `domain` se souber). A próxima sessão grava sozinha.
