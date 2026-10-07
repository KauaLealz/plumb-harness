# Molde de item do cérebro

Para gravar você mesmo uma regra, decisão ou gotcha simples (sem despachar o
curador). Padrões novos, procedimentos e lotes com 3 sinais ou mais vão ao
`plumb-dreamer`.

```json
{"key": "regra/money", "type": "rule",
 "title": "Money em pagamentos",
 "summary": "Valores sempre em centavos inteiros (Money, em shared/money) — float perde centavos em somas.",
 "content": "Exemplo: 1990 = R$ 19,90. Exceção: relatórios, que formatam só na borda.",
 "scope_paths": ["src/payments/**"], "keywords": "dinheiro valor centavos preço",
 "source": "PAY-142"}
```

Grave com `item_save(repo=".", items=[...])`. Resposta `action: unchanged`
= já existia igual; `similar` = título parecido já guardado (releia antes de
duplicar).

## Quando guardar

Guarde em momentos certos, não a cada passo:

| Momento | O que costuma nascer |
|---|---|
| O usuário enuncia uma regra, decisão ou preferência ("sempre…", "aqui a gente…", "prefiro…") | `rule`, `insight` ou preferência no `Global` — **na hora**, sem perguntar; confirme em uma linha |
| Você travou e resolveu algo não óbvio (depois de resolvido, não durante) | `knowledge`: sintoma, causa e o que fazer |
| No fechamento de cada mudança, num lote só | `insight` das decisões com porquê, `pattern` do que o projeto fez pela primeira vez, `procedure` do que você executou e vai se repetir, `knowledge` do que custou tempo |
| Uma pergunta sobre o código custou exploração e vai ser feita de novo | `context` (o que o projeto é) ou `knowledge` |
| Setup, migração e retro | Consolidação: reforçar, juntar, aposentar |

Não guarde a cada comando, nem o que você descobriu com uma leitura de arquivo:
se é barato redescobrir, não é memória.

## Que tipo — e o teste de cada um

| Tipo | Guarde quando… | Teste antes de gravar |
|---|---|---|
| `rule` | Há um sempre/nunca do código, enunciado pelo usuário ou que uma revisão cobraria | Dá para dizer olhando um diff se ele cumpre a regra? |
| `insight` | Escolheu-se entre alternativas e o porquê vai importar depois | Tem a alternativa descartada e o motivo? Alguém perguntaria "por que é assim?" |
| `procedure` | Passos que você executou e vão se repetir (migration, release, ambiente, deploy) | Um agente novo executaria só com o `content`, com os comandos exatos? |
| `pattern` | O projeto resolveu um tipo de problema pela primeira vez e isso deve ser copiado | Aponta o arquivo que serve de modelo? |
| `knowledge` | Comportamento não óbvio do código que custou tempo e voltaria a custar | Tem sintoma, causa e o que fazer? |
| `context` | O que o projeto é: produto, quem usa, termos do domínio, mapa do código | Muda raramente? Poucos itens (`contexto/produto`, `contexto/mapa`), sempre atualizados pela mesma key |
| `task` | O plano de cada mudança (o orquestrador cuida) | — |

Antes de criar, procure (`item_search`): existe item sobre isso? **Atualize pela
mesma key** em vez de criar outro; se o novo contradiz o antigo, `supersedes`.

## Onde

| Vale para… | Destino |
|---|---|
| Só este repositório | O project do repositório (o padrão do `item_save` com `repo="."`) |
| Os repositórios deste contexto (a empresa ou o cliente): convenções, padrões de design, práticas | Project `Geral` do mesmo workspace (`"project": "Geral"` na entrada) |
| Você, em qualquer contexto: idioma, estilo, preferências, ambiente da sua máquina, ferramenta em geral | Workspace `Global`, project `Geral` |

Na dúvida entre o repo e o `Geral`, o repo — e diga onde guardou.

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

## Segredos (token, senha, chave de API)

O valor nunca passa por você. Grave o item **sem valor** e cole na sua resposta
o link literal que o `item_save` devolve (`fill_url`) — não parafraseie nem
só mencione que ele existe; sem o link colado, o usuário não tem como preencher
o valor na UI local.

```json
{"key": "segredo/npm-token", "type": "secret", "title": "Token do npm",
 "summary": "Publicar os pacotes da Polara no npm"}
```

- Onde: como qualquer item — só este repo, o `Geral` do workspace (o token da
  empresa) ou o `Global` (o token pessoal do usuário).
- Usar: `knowledge-mcp run --env NPM_TOKEN=segredo/npm-token -- npm publish`
  (ou `--stdin segredo/<nome>` para `--password-stdin`). O pacote de contexto
  lista os segredos e diz se já têm valor.
- O usuário colou o valor no chat? Não grave nem repita; crie o item vazio,
  mande o link e sugira trocar a credencial (ela já está no histórico).

## Não guarde

Dado pessoal; credencial, URL com senha ou token dentro de um item comum (o
servidor recusa). Decisão que vale só para uma mudança (fica nas Decisões dela).

## Cérebro fora do ar

Uma entrada por linha em `~/.knowledge-os/pending.jsonl`: o mesmo objeto de
`items` mais `"project": "<caminho absoluto do repositório>"`. A próxima sessão
grava sozinha (o hook do início esvazia a fila).
