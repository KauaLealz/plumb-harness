# O segundo cérebro (Knowledge OS v2)

Memória durável do trabalho: regras, decisões e o porquê, procedimentos, o que o
projeto é e as specs das mudanças. Este arquivo é o contrato completo de como
ler, gravar, organizar e relacionar. Leia uma vez por sessão, antes da primeira
gravação. O contrato por fase (o que ler e gravar em cada momento) fica na
tabela do `SKILL.md`.

## 1. Modelo mental

```
workspace   contexto de trabalho: a empresa, o cliente, o seu pessoal
 └─ project   um repositório (ou um conjunto de itens com dono: preferencias, compartilhado)
     └─ subject   assunto com nome próprio dentro de um project (opcional)
         └─ item   um conhecimento: tipo, key, resumo, conteúdo
```

**Onde o item mora e onde ele vale são coisas diferentes.**

- **Mora** no project em que foi salvo. Organiza e audita; nunca muda sozinho.
- **Vale** conforme o `scope`, que o item herda do subject, do project e do
  workspace, o mais próximo que for explícito. Sem nada explícito, é `scoped`.

| scope | Quem vê o item |
|---|---|
| `scoped` | só os repositórios ligados ao project dele |
| `workspace` | os repositórios de todos os projects do mesmo workspace |
| `global` | qualquer repositório, qualquer workspace, até pasta não ligada |

Resultado de busca e pacote do hook trazem o scope efetivo e o `where` (de que
workspace e project veio). Item de fora do project do repositório vem marcado
com a origem: leia o marcador antes de aplicar a regra.

Um repositório de código é **ligado** a um workspace e um project (`repo`, ação
`link`). O pacote que o hook injeta no início da sessão já traz o essencial do
project ligado, o que vale para o workspace e o que é global.

## 2. As ferramentas (32)

Prefixo `mcp__knowledge-os__`. Todas aceitam `connection_id` opcional (sem ele,
a conexão padrão).

| Grupo | Ferramentas | Para quê |
|---|---|---|
| Ler | `item_search`, `item_get`, `item_graph` | achar, ler completo, navegar relações |
| Gravar | `item_save`, `item_delete`, `item_feedback` | criar e atualizar em lote, limpar, avisar o que ajudou |
| Relacionar | `relation_create`, `relation_delete` | ligar itens existentes, em lote |
| Vocabulário | `tag_list`, `tag_create`, `tag_update`, `tag_delete` | tags gerenciadas |
| Organizar | `workspace_*`, `project_*`, `subject_*` (`list`, `create`, `update`, `merge`, `delete`) | a estrutura |
| Ligar repositório | `repo` (`action`: `link`, `list`, `unlink`, `sync`) | repositório de código ↔ workspace/project |
| Conexão | `connection_create`, `connection_list`, `connection_delete` | onde os arquivos ficam (uma pasta, repositório git) |
| Saúde | `health_check` | conexões, arquivos que não parseiam, `gh` |

Sem conexão cadastrada, qualquer ferramenta devolve o exemplo de
`connection_create(name, path)`. A conexão é uma pasta que o usuário escolhe;
nunca crie uma sem o "sim" dele.

## 3. Tipos e subtipos

Cinco tipos. O subtipo é fechado: o servidor recusa um inválido e o erro lista os
válidos, então escolha pelo erro em vez de inventar. Sem subtipo que sirva,
omita.

| Tipo | É | Teste antes de gravar |
|---|---|---|
| `rule` | o que vale e deve ser seguido. Subtipos: `code` (convenção de código), `pattern` (molde de composição), `security` (auth, pagamento, dado pessoal, tenant, segredo), `business` (regra de negócio), `process` (como o time trabalha), `decision` (escolha entre alternativas, com o porquê) | Dá para dizer, olhando um diff ou uma decisão, se ela foi cumprida? |
| `howto` | passo a passo e diagnóstico. Subtipos incluem `troubleshoot` (sintoma, causa, solução) | Um agente novo executaria só com o `content`, com os comandos exatos? |
| `context` | o que o projeto é: produto, mapa do código, stack e ferramentas, ambiente. Subtipos incluem `environment` | Muda raramente? São poucos itens, sempre atualizados pela mesma key? |
| `spec` | a spec de uma mudança, e o progresso do setup | O orquestrador cuida; termina `done` |
| `secret` | segredo, sem valor (seção 11) | — |

**Modelo do `content` por subtipo.** O servidor só avisa quando falta; cumpra:

| Subtipo | O `content` traz |
|---|---|
| `rule/decision` | `## Por quê` e `## Alternativa descartada` |
| `rule/pattern` | `Arquivo-modelo: <caminho>` e a lista do que todo artefato desse tipo tem |
| `howto/troubleshoot` | `## Sintoma`, `## Causa`, `## Solução` |
| `context/environment` | os links (campo `links`) para onde o ambiente é descrito |

`pattern` é molde de composição ("toda página de listagem tem breadcrumb,
título, busca com filtro, lista plana e paginador"), não "a primeira vez que
resolvemos algo": isso é `howto/troubleshoot` ou `rule/decision`.

## 4. Campos

| Campo | Regra |
|---|---|
| `key` | `<tipo>/<nome>`, minúscula, hífen: `rule/money`, `howto/migration`, `spec/pay-142`, `context/stack`. Mesma key = atualiza no lugar onde o item mora, nunca duplica. Key de item que já existe nunca muda |
| `title` | curto, o nome da coisa |
| `summary` | 1–2 frases no imperativo, **com o porquê**. É o que o pacote mostra; se precisa do `content` para ser seguido, está fraco |
| `content` | exemplo, exceção, passos com comandos exatos, o modelo do subtipo |
| `scope` | `scoped`, `workspace` ou `global`; omita para herdar |
| `scope_paths` | os arquivos onde a regra **de fato** vale, o mais estreito possível (`src/payments/**`). Sem escopo, aparece em toda sessão do project |
| `keywords` | 4–8 sinônimos em português que **outra pessoa** digitaria para achar o item (o termo do dia a dia, o nome em inglês, o erro que ela veria). É indexado; nunca repita o título |
| `tags` | assunto transversal, do vocabulário gerenciado (seção 8) |
| `links` | `[{title, url}]` para o que existe fora (doc, card, dashboard) |
| `origin` | quem fez o item nascer: `user` (o usuário ditou ou respondeu), `code` (inferido do código, com evidência no `content` ou `source`), `agent` (o resto; é o padrão). O servidor nunca apaga nem rebaixa `origin=user` |
| `status` | `active`, `review` (suspeito: vem depois nas buscas e marcado), `archived`. Só `spec` tem também `draft` e `done` |
| `source` | `commit abc1234`, `spec/<id>` ou `pedido do usuário AAAA-MM-DD`; nunca um arquivo que vai deixar de existir |
| `ttl_days` | só para nota temporária; vencido some da busca |

`item_save` devolve `warnings` por entrada (modelo do `content` faltando, key
fora do padrão, tag nova, nome antigo aceito como alias). **Leia os avisos e
corrija na mesma sessão**; não os ignore.

Campos de versões antigas (rótulos, classe de memória, importância, confiança) são
ignorados com aviso; rótulos viram tags.

## 5. Ler

```python
item_search(repo=".")                                          # sem consulta: o essencial (segurança, regras, contexto, specs ativas)
item_search(repo=".", query="estorno parcial", paths=["src/payments/refund.js"])
item_search(repo=".", queries=["migration", "rollback"])       # até 5 consultas num lote
item_search(repo=".", query="deploy", types=["howto"], status=["active"])
item_search(repo=".", tags=["pagamentos"], scope=["global"])   # filtros: types, subtypes, status, tags, paths, origin, scope
item_search(workspace="Polara", query="cache")                 # o workspace inteiro, inclusive o que é scoped de outros projects
item_search(everywhere=True, query="webhook")                  # toda a base
item_get(keys=["rule/money", "howto/migration"], repo=".")     # completo; até 20
item_graph(keys=["howto/deploy"], repo=".", depth=1)           # vizinhos por relação, com limite
```

- **Isolamento entre contextos.** Item de **outro workspace** (o `where` mostra) é
  para você saber, não para vazar: não o cite, copie nem transforme em código, PR ou
  mensagem no repositório de outro cliente sem o usuário saber de onde veio.
  `workspace=` e `everywhere=True` só quando o usuário pede ou o trabalho exige.
- **A busca devolve resumos, nunca o `content`.** `paths` casa com o
  `scope_paths` e traz um trecho (`excerpt`): na área tocada, o `content`
  do que importa já vem junto. `item_get` só se faltar detalhe.
- **Cadeia de busca:** primeiro os itens do project ligado, depois os de outros
  projects do mesmo workspace com scope `workspace` ou `global`, depois os de
  outros workspaces com scope `global`. Item `scoped` de outro project não
  aparece, e é o certo.
- **Resultado explicado:** cada item traz scope efetivo, `where`, `matched_in`
  (título, palavra-chave, tag, path) e `snippet`. Item em `review` vem depois e
  marcado: trate como suspeito e confirme no código antes de seguir.
- **Busca vazia não prova ausência.** Tente um sinônimo, o termo em inglês, o
  texto do erro; quando achar pelo sinônimo, grave-o em `keywords`.
- Pasta não ligada vê só os itens globais e recebe a sugestão de ligar o
  repositório.
- Buscar vale **antes de explorar código** numa área nova, **ao travar** (um
  `howto/troubleshoot` guardado vale mais que uma hipótese) e **antes de gravar**
  (duplicata).

## 6. Relações e grafo

Relacione quando o leitor de A precisaria abrir B para agir certo. Se é só "tem a
ver", não relacione: `keywords` e a busca já cobrem.

| Tipo | Use quando | Efeito |
|---|---|---|
| `supersedes` | o novo substitui o antigo | o antigo vira `archived` e sai da busca, com o histórico |
| `depends_on` | seguir A exige ter feito B | howto que pressupõe outro |
| `implements` | A concretiza uma regra ou decisão mais ampla | molde → regra |
| `derived_from` | A nasceu de B | — |
| `references` | A cita B, mas funciona sem ele | — |
| `related_to` | nenhum dos acima | default fraco: na dúvida, não relacione |

```python
relation_create(repo=".", items=[{"source": "howto/deploy-v2", "type": "supersedes", "target": "howto/deploy"}])
relation_delete(repo=".", items=[{"source": "...", "type": "...", "target": "..."}])
```

`source` e `target` são key ou id; até 20 por chamada; repetir uma relação é
inofensivo. Trocar o tipo é apagar e criar. `item_save` ainda aceita `relations`
numa entrada, mas avisa: prefira `relation_create`. `item_graph` serve para ver o
que está em volta de um item antes de mudá-lo (`depth` 1–3, `limit`, filtros de
tipo de relação e de tipo de item).

## 7. Onde guardar

Primeiro a pergunta **"vale para quem?"**, depois a moradia.

| Vale para… | Mora em | scope |
|---|---|---|
| só este repositório | o project do repositório | `scoped` (omita) |
| todos os repositórios deste contexto (a empresa, o cliente) | um project do workspace só para isso (sugestão: `compartilhado`) | `workspace` no project |
| o usuário em qualquer contexto: idioma, estilo, preferências, a máquina | o project `preferencias` do workspace pessoal do usuário (o workspace com scope `global` em `workspace_list`) | `global` no workspace |
| nasceu neste repositório mas vale mais amplo (uma regra de segurança que serve a todos os repositórios da empresa) | o project do repositório | `workspace` ou `global` **no item** |

- Item que vale além do repositório mora num project próprio do contexto, não
  escondido num repositório: assim é auditável, e preferência pessoal nunca
  acaba numa conexão compartilhada com o time. Sem workspace pessoal global
  ainda, proponha criá-lo (`workspace_create` com `scope="global"`, depois
  `project_create` `preferencias`) e espere o "sim"; sem isso, salve no project
  do repositório com `scope="global"` e diga onde guardou.
- Gravar num lugar que não é o do repositório ligado: informe `workspace` e
  `project` na entrada do `item_save` em vez de `repo`.
- Mover um item: `item_save` com o `id` e o `workspace`/`project`/`subject` novos.
  Mudar o scope de um workspace, project ou subject (`*_update`) muda o alcance de
  tudo que herda: avise antes.

**Quando criar a estrutura:**

| Nível | Crie quando | Nunca |
|---|---|---|
| `workspace` | outro contexto de trabalho. `workspace_list` antes, para não duplicar com outra grafia | por projeto, por área ou por fase |
| `project` | repositório novo; ou o lugar de itens compartilhados de um contexto | por área, time ou tecnologia |
| `subject` | a área já tem 3 itens ou mais e o time usa o nome falando (`pagamentos`, `onboarding`) | com 1–2 itens; como disfarce de tipo (`regras`, `decisões`) |

`subject` nasce tarde: comece sem e crie quando o volume pedir. Se um item
caberia em dois subjects, o recorte está errado.

## 8. Tags

Tag é **vocabulário gerenciado**: serve ao recorte transversal que o tipo e o
project não dão (`pagamentos`, `lgpd`, `checkout`), e filtra a busca.

- `tag_list` antes de usar uma: reaproveite em vez de criar variação.
- Crie (`tag_create`) quando o assunto já tem 3 itens ou mais e alguém pediria
  "me traz tudo de X". Nunca repita o tipo nem o project; nunca use uma vez só.
- `item_save` com tag nova cria e avisa, sugerindo a parecida: confira.
- Renomear ou mesclar: `tag_update`. Apagar: `tag_delete`, que mostra a prévia
  com quantos itens e só remove com `confirm=True`.
- Tag e `subject` se parecem: o subject é onde o item **mora** (um só); a tag é
  do que ele **fala** (várias). Na dúvida, tag: não move nada de lugar.

## 9. Grava direto ou confirma

O usuário não precisa aprovar o que ele mesmo mandou; precisa aprovar o que você
**inferiu**. Na dúvida, confirme: um item errado envenena todas as sessões
seguintes, e esperar cinco segundos não custa nada.

| Grava na hora e confirma em uma linha | Mostra e espera o "sim" |
|---|---|
| o que o usuário **ditou** (`origin=user`) num lugar óbvio | qualquer item inferido (`origin=agent` ou `code`): howto, pattern, context, rule que você deduziu |
| a `spec` que o usuário já aprovou | qualquer item com `scope=global` |
| `secret` vazio (sem valor) | workspace, project, subject ou tag **novos**; `supersedes`; mover item |
| `item_feedback` | `connection_create` |
| `status: review` ou `archived` de item que o trabalho contradisse, com a evidência | apagar (`item_delete`) |

Se o usuário ditou e o lugar não é óbvio (repositório, empresa ou global?),
proponha o lugar na confirmação, uma pergunta só.

## 9b. Antes de criar: três passos contra duplicata

1. Monte a key que usaria e `item_get` por ela. Existe? Atualize por ela;
   nunca crie variação (`rule/money-2`).
2. `item_search` pelos termos do título (e, se a área tem tag, `tags=[...]`). O
   que parece o mesmo assunto é o mesmo item.
3. Decida: certo mas incompleto → mesma key, enriquece; errado ou superado → mesma
   key se é correção, key nova com `supersedes` se o histórico importa; só parece →
   key nova, e relacione **só** se o leitor de um precisar do outro.

Regra existia e foi ignorada? O problema é aderência (falta o porquê, um exemplo,
`keywords` ou `scope_paths`), não de regra faltando: reforce o item.

## 10. O que não é item

| Se é… | Vai para… |
|---|---|
| bug, dívida, "candidato a correção" | um card ou uma spec. Bug é trabalho, não fato |
| andamento ("ainda falta X", "corrigido na branch Y") | o `summary` da spec |
| medição datada (contagem de testes, erros de lint de hoje) | as Notas da spec; no máximo uma nota com `ttl_days` |
| como o Plumb, o cérebro ou o harness funcionam | nada: já está nas instruções |
| o que o código ou o `AGENTS.md` mostram em segundos | nada |
| id de tarefa, número de linha, arquivo que vai deixar de existir | nunca no item (use classe, método, símbolo; `source` com commit) |

**Sensível.** Auth e autorização, pagamento, dado pessoal, isolamento de tenant e
segredos são `rule/security`: o pacote e a busca os destacam, e é o que liga a
revisão de segurança. Não marque outra coisa como segurança.

Instruções positivas; proibição só para o que é perigoso, com o motivo. No
idioma do usuário. Nunca segredo nem dado pessoal.

## 11. Segredos (token, senha, chave de API)

O valor nunca passa por você. Grave o item **sem valor** e cole na resposta o
link literal que o `item_save` devolve (`fill_url`): sem ele o usuário não tem
como preencher na UI local.

```json
{"key": "secret/npm-token", "type": "secret", "title": "Token do npm",
 "summary": "Publicar os pacotes da empresa no npm"}
```

Usar: `knowledge-mcp run --env NPM_TOKEN=secret/npm-token -- npm publish` (ou
`--stdin secret/<nome>`). O usuário colou o valor no chat? Não grave nem repita:
crie o item vazio, mande o link e sugira trocar a credencial.

## 12. Feedback: o cérebro aprende com o uso

`item_feedback` diz ao servidor o que valeu, e alimenta ranking, limpeza e o
relatório do `/plumb-dream`. Em lote, no fechamento da mudança:

```python
item_feedback(repo=".", items=[
  {"key": "rule/money", "outcome": "helped"},
  {"key": "howto/old-deploy", "outcome": "outdated", "note": "o comando agora é make release"},
  {"key": "rule/payments-cache", "outcome": "verified"},
])
```

| outcome | Use quando | Efeito |
|---|---|---|
| `helped` | o item entrou no trabalho e valeu | sobe no ranking |
| `irrelevant` | o pacote ou a busca trouxe e não serviu | desce no ranking (nunca para `origin=user`) |
| `wrong` / `outdated` | o trabalho contradisse o item | vira `review`, com a nota |
| `verified` | a prova confirmou a regra da área | grava `verified_at` e o commit; o servidor passa a avisar `drift` se os arquivos do escopo mudarem depois |

Só dê `helped` e `irrelevant` ao que você de fato viu entrar no trabalho: feedback
inventado estraga o ranking.

## 13. Cérebro fora do ar ou sem conexão

- **Fora do ar** (erro de conexão com o servidor, `ConfigError`): avise em uma
  linha, siga com o plano no chat e guarde o que gravaria em
  `~/.knowledge-os/pending.jsonl`, uma entrada por linha: o mesmo objeto do
  `item_save` mais `"repo": "<caminho absoluto do repositório>"` (e `"workspace"`/
  `"project"` se não for o ligado). O hook da próxima sessão grava a fila.
  **Escreva o JSON por um heredoc com delimitador entre aspas simples**
  (`cat >> ~/.knowledge-os/pending.jsonl <<'EOF'`, uma linha de JSON válido, e
  `EOF`), nunca por `echo "…"`: aspas, `$` e crase do conteúdo seriam executados ou
  corromperiam a linha. Segredo nunca entra na fila.
- **Sem conexão:** diga em uma linha e proponha `connection_create` com uma pasta
  (sugestão: uma pasta própria fora do repositório de código); só crie com o "sim".
- **Antes de gravar uma fila grande**, `health_check`: mostra arquivos que não
  parseiam.

## 14. Limpeza e manutenção

`item_delete` sem `keys` lista candidatos com o motivo (vencido, arquivado há
mais de 90 dias, `review` há mais de 14, nunca aberto por 90 dias, sempre
irrelevante), nunca de `origin=user`. Com `keys` mostra a prévia; só apaga com
`confirm=True`. Prefira `archived` a apagar quando o histórico importa.
`knowledge-mcp report --json` traz o retrato (nunca abertos, em `review`, alta
taxa de irrelevante, buscas vazias, tags sem item): é a entrada da auditoria do
`/plumb-dream`.
