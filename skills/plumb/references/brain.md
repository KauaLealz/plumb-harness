# O segundo cérebro (Knowledge OS v6)

Memória durável do trabalho: o que seguir, como fazer, o que o projeto é, e o
trabalho (planos e o porquê). Este arquivo é o contrato completo de como ler,
gravar, organizar e relacionar. Leia uma vez por sessão, antes da primeira
gravação. O contrato por fase (o que ler e gravar em cada momento) fica no
`SKILL.md` da situação.

**Princípio:** schema mínimo no cérebro; a nuance e o ciclo vivem em **tags**, não
em campos. Menos regra presa no cérebro, mais inteligência aqui no harness.

## 1. Modelo mental

```
workspace   contexto de trabalho: a empresa, o cliente, o seu pessoal
 └─ project   um repositório (ou um conjunto de itens com dono)
     └─ subject   assunto com nome próprio dentro de um project (opcional)
         └─ item   um conhecimento: tipo, key, resumo, conteúdo, tags, links
```

**O alcance é a hierarquia: o item vale onde mora e abaixo.** Não há campo
`scope`.

| Mora em… | Vale para… |
|---|---|
| workspace (sem project) | todos os projects e subjects daquele workspace |
| project | aquele project e seus subjects |
| subject | só aquele subject |

A regra do banco que vale em todos os microsserviços **mora no workspace**; a
convenção de um serviço mora no project. Resultado de busca e pacote do hook
trazem o `where` (de que workspace/project/subject veio) e pesam mais o que está
mais perto do seu project. Um repositório de código é **ligado** a um workspace e
um project (`repo`, ação `link`); o pacote que o hook injeta no início da sessão
já traz o essencial do que o repositório enxerga.

## 2. As ferramentas (31)

Prefixo `mcp__knowledge-os__`. Todas aceitam `connection_id` opcional (sem ele, a
conexão padrão).

| Grupo | Ferramentas | Para quê |
|---|---|---|
| Ler | `item_search`, `item_get`, `item_graph` | achar, ler completo, navegar links |
| Gravar | `item_save`, `item_delete` | criar e atualizar em lote, remover |
| Relacionar | `relation_create`, `relation_delete` | ligar itens existentes (item↔item) |
| Vocabulário | `tag_list`, `tag_create`, `tag_update`, `tag_delete` | tags gerenciadas |
| Organizar | `workspace_*`, `project_*`, `subject_*` (`list`, `create`, `update`, `merge`, `delete`) | a estrutura |
| Ligar repositório | `repo` (`action`: `link`, `list`, `unlink`, `sync`) | repositório ↔ workspace/project |
| Conexão | `connection_create`, `connection_list`, `connection_delete` | onde os arquivos ficam (uma pasta git) |
| Saúde | `health_check` | conexões, arquivos que não parseiam, `gh` |

Não há mais `o feedback`: quando um item ajuda, não há nada a registrar; quando
está errado ou velho, você o **corrige ou remove** (é git, dá para voltar).

Sem conexão cadastrada, qualquer ferramenta devolve o exemplo de
`connection_create(name, path)`. A conexão é uma pasta que o usuário escolhe;
nunca crie uma sem o "sim" dele.

## 3. Os cinco tipos (sem subtipo)

O subtipo saiu: a nuance vai em **tags**. Cinco tipos; o servidor recusa um tipo
inválido e o erro lista os válidos.

| Tipo | É | Teste antes de gravar |
|---|---|---|
| `rule` | o que vale e deve ser seguido (convenção, decisão, regra de negócio, processo) | Dá para dizer, olhando um diff ou uma decisão, se foi cumprida? |
| `howto` | passo a passo ou diagnóstico | Um agente novo executaria só com o `content`, com os comandos exatos? |
| `context` | o que o projeto é (produto, mapa do código, stack, glossário, ambiente) | Muda raramente? Poucos itens, atualizados pela mesma key? |
| `work` | o trabalho de uma mudança: plano + decisões, o porquê durável | O orquestrador cuida; o ciclo vai em tag, termina com a tag `done` |
| `secret` | segredo, sem valor (seção 11) | — |

**Guia de escrita do `content` (aqui no harness, não cobrado pelo servidor):**

| Tipo (com a tag) | O `content` traz |
|---|---|
| `rule` tag `decision` | `## Por quê` e `## Alternativa descartada` |
| `rule` tag `pattern` | `Arquivo-modelo: <caminho>` e o que todo artefato desse tipo tem |
| `howto` tag `troubleshoot` | `## Sintoma`, `## Causa`, `## Solução` |
| `work` | `## Objetivo`, `## Resultados esperados`, `## Fases`, `## Decisões` |

## 4. Campos

| Campo | Regra |
|---|---|
| `key` | `<tipo>/<nome>`, minúscula, hífen: `rule/money`, `howto/migration`, `work/pay-142`, `context/stack`. Mesma key = atualiza no lugar, nunca duplica. Key de item que já existe nunca muda |
| `type` | um dos cinco |
| `title` | curto, o nome da coisa |
| `summary` | 1–2 frases no imperativo, **com o porquê**. É o que o pacote mostra; se precisa do `content` para ser seguido, está fraco |
| `content` | exemplo, exceção, passos com comandos exatos, o modelo do tipo |
| `tags` | **toda a nuance e o ciclo** (seção 8): nuance (`decision`, `troubleshoot`, `security`, `pattern`, `map`, `glossary`…), ciclo do `work` (`draft`, `active`, `done`, `archived`), e 1 a 3 de área/tema |
| `links` | unificado: liga a outro item (`{item: "<key>", rel: "depends_on"\|"relates_to"}`) ou a uma referência externa (`{url: "…", title?}` \| `{path: "src/**"}`) |

Removidos no v6: `subtype`, `scope`, `status`, `origin`, `ttl_days`, `keywords`,
`source`. `item_save` devolve `warnings` por entrada (key fora do padrão, tag
nova com sugestão de uma parecida): **leia e corrija na mesma sessão**.

## 5. Ler

```python
item_search(repo=".")                                          # sem consulta: o essencial (seguranca, regras, contexto, trabalho)
item_search(repo=".", query="estorno parcial", paths=["src/payments/refund.js"])
item_search(repo=".", queries=["migration", "rollback"])       # até 5 consultas num lote
item_search(repo=".", query="deploy", types=["howto"], tags=["pagamentos"])  # filtros: types, tags, paths
item_search(workspace="Polara", query="cache")                 # o workspace inteiro
item_search(everywhere=True, query="webhook")                  # toda a base
item_get(keys=["rule/money", "howto/migration"], repo=".")     # completo; até 20
item_graph(keys=["howto/deploy"], repo=".", depth=1)           # vizinhos por link, com limite
```

- **Isolamento entre contextos.** Item de **outro workspace** (o `where` mostra) é
  para você saber, não para vazar: não o cite, copie nem transforme em código, PR
  ou mensagem no repositório de outro cliente sem o usuário saber de onde veio.
  `workspace=` e `everywhere=True` só quando o usuário pede ou o trabalho exige.
- **A busca devolve resumos, nunca o `content`.** `paths` casa com os `links` de
  tipo `{path}` e traz um trecho (`excerpt`). `item_get` só se faltar detalhe.
- **Alcance pela hierarquia:** primeiro o project ligado, depois o que mora acima
  dele na hierarquia (o workspace) — quanto mais perto, maior o peso. Item de um
  subject ou project irmão não aparece, e é o certo.
- **Resultado explicado:** cada item traz `where`, `matched_in` (título, tag,
  path) e `snippet`. A tag `archived` fica escondida por padrão.
- **Busca vazia não prova ausência.** Tente um sinônimo, o termo em inglês, o
  texto do erro.
- Buscar vale **antes de explorar código** numa área nova, **ao travar** (um
  `howto` guardado vale mais que uma hipótese) e **antes de gravar** (duplicata).
- **Item errado ou velho:** corrija (regrava pela mesma key) ou remova
  (`item_delete`). Não existe feedback a registrar.

## 6. Links e grafo

`links` unifica a ligação a outro item e a referência externa. Ligue dois itens
quando o leitor de A precisaria abrir B para agir certo. Se é só "tem a ver", não
ligue: a busca já cobre.

| rel (item↔item) | Use quando |
|---|---|
| `depends_on` | seguir A exige ter feito B (howto que pressupõe outro; work que realiza uma regra) |
| `relates_to` | ligação geral: A e B andam juntos |

Não há `supersedes`: o item anterior é **ajustado ou removido**, não "superado".

```python
relation_create(repo=".", items=[{"source": "howto/deploy-ci", "type": "depends_on", "target": "rule/deploy"}])
relation_delete(repo=".", items=[{"source": "...", "type": "...", "target": "..."}])
```

Referência externa (arquivo/URL) vai no campo `links` do `item_save`
(`{path}`/`{url}`). `item_graph` mostra o que está em volta de um item antes de
mudá-lo (`depth` 1–3, `limit`).

## 7. Onde guardar

Primeiro a pergunta **"vale para quem?"**, depois a moradia — o alcance é a
hierarquia, não um campo.

| Vale para… | Mora em |
|---|---|
| só este repositório | o project do repositório |
| um assunto/área do repositório com 2+ itens | um subject do project |
| todos os repositórios deste contexto (a empresa, o cliente) | direto no **workspace** (sem project) |
| o usuário em qualquer contexto: idioma, estilo, preferências | o workspace **Pessoal** do usuário |

- Gravar num lugar que não é o do repositório ligado: informe `workspace` (e
  `project`/`subject`, se houver) na entrada do `item_save` em vez de `repo`. Um
  item que vale no workspace inteiro é gravado **só com `workspace`**, sem
  `project`.
- Mover um item: `item_save` com o `id` e o `workspace`/`project`/`subject` novos.

**Quando criar a estrutura:**

| Nível | Crie quando | Nunca |
|---|---|---|
| `workspace` | outro contexto de trabalho (`workspace_list` antes, para não duplicar a grafia) | por projeto, por área ou por fase |
| `project` | repositório novo | por área, time ou tecnologia |
| `subject` | um conceito de domínio conhecido (`crédito-privado`), **ou** a área já tem 2+ itens de um tema | com 0–1 item; como disfarce de tipo (`regras`, `decisões`) |

`subject` começa solto e se formaliza quando o conceito emerge ou o volume pede.
Se um item caberia em dois subjects, o recorte está errado.

## 8. Tags (toda a nuance e o ciclo)

A tag é **vocabulário gerenciado** e carrega o que no v2 era subtipo e status, mais
o recorte transversal. Base em inglês, extensível.

- **Ciclo** (sobretudo do `work`): `draft`, `active`, `done`, `archived`.
- **Nuance** (ex-subtipo): `decision`, `troubleshoot`, `security`, `pattern`,
  `map`, `glossary`, `product`, `environment`, `business`, `process`.
- **Área/tema:** `pagamentos`, `lgpd`, `checkout`, `auth`… 1 a 3 por item.
- **Vocabulário curto e reaproveitado.** `tag_list` **antes** de dar tags a um
  item: reaproveite a existente (`pagamentos`, não `pagamento` nem `payments`).
- `item_save` com tag nova cria e avisa, sugerindo a parecida: confira e regrave
  com a existente. Renomear/mesclar: `tag_update`. Apagar: `tag_delete` (prévia;
  só com `confirm=True`).
- **Segurança** é só a tag `security`, sem peso especial: a lente de segurança do
  revisor se deduz da área/conteúdo (auth, pagamento, dado pessoal, segredo no
  diff), não de uma marcação.
- Tag e `subject` se parecem: o subject é onde o item **mora** (um só); a tag é do
  que ele **fala** (várias). Na dúvida, tag: não move nada de lugar.

## 9. Grava direto ou confirma

O usuário não precisa aprovar o que ele mesmo mandou; precisa aprovar o que você
**inferiu**. Não há campo `origin`: a disciplina é de comportamento. Na dúvida,
confirme: um item errado envenena todas as sessões seguintes.

| Grava na hora e confirma em uma linha | Pergunta pela ferramenta de perguntas |
|---|---|
| o que o usuário **ditou** num lugar óbvio | qualquer item que você **inferiu** (howto, pattern, context, rule deduzida) |
| a `work` que o usuário já aprovou | qualquer item no nível do **workspace** (transversal) |
| `secret` vazio (sem valor) | workspace, project, subject ou tag **novos**; mover item; apagar (`item_delete`) |

Se o usuário ditou e o lugar não é óbvio (repositório, workspace?), proponha o
lugar na confirmação, uma pergunta só.

## 9b. Antes de criar: três passos contra duplicata

1. Monte a key que usaria e `item_get` por ela. Existe? Atualize por ela; nunca
   crie variação (`rule/money-2`).
2. `item_search` pelos termos do título (e, se a área tem tag, `tags=[...]`).
3. Decida: certo mas incompleto → mesma key, enriquece; errado ou superado → mesma
   key (ajusta) ou remove o antigo; só parece → key nova, e ligue **só** se o
   leitor de um precisar do outro.

Regra existia e foi ignorada? O problema é aderência (falta o porquê, um exemplo,
um `{path}` em `links`), não de regra faltando: reforce o item.

## 10. O que não é item

| Se é… | Vai para… |
|---|---|
| bug, dívida, "candidato a correção" | um card ou um `work`. Bug é trabalho, não fato |
| andamento ("ainda falta X", "corrigido na branch Y") | o `summary`/`content` do `work` |
| medição datada (contagem de testes, erros de lint de hoje) | as Notas do `work` |
| como o Plumb, o cérebro ou o harness funcionam | nada: já está nas instruções |
| o que o código ou o `AGENTS.md` mostram em segundos | nada |
| id de tarefa, número de linha, arquivo que vai deixar de existir | nunca (use classe, método, símbolo) |

Instruções positivas; proibição só para o que é perigoso, com o motivo. No idioma
do usuário. Nunca segredo nem dado pessoal.

## 11. Segredos (token, senha, chave de API)

O valor nunca passa por você. Grave o item **sem valor** e cole na resposta o link
literal que o `item_save` devolve (`fill_url`): sem ele o usuário não tem como
preencher na UI local.

```json
{"key": "secret/npm-token", "type": "secret", "title": "Token do npm",
 "summary": "Publicar os pacotes da empresa no npm"}
```

Usar: `knowledge-mcp run --env NPM_TOKEN=secret/npm-token -- npm publish`. O
usuário colou o valor no chat? Não grave nem repita: crie o item vazio, mande o
link e sugira trocar a credencial.

## 12. Cérebro fora do ar ou sem conexão

- **Fora do ar** (`ConfigError`): avise em uma linha, siga com o plano no chat e
  guarde o que gravaria em `~/.knowledge-os/pending.jsonl`, uma entrada por linha:
  o mesmo objeto do `item_save` mais `"repo": "<caminho absoluto>"`. **Escreva o
  JSON por um heredoc com delimitador entre aspas simples**
  (`cat >> ~/.knowledge-os/pending.jsonl <<'EOF'` … `EOF`), nunca por `echo "…"`.
  Segredo nunca entra na fila.
- **Sem conexão:** diga em uma linha e proponha `connection_create` com uma pasta
  própria fora do repositório; só crie com o "sim".
- **Antes de uma fila grande**, `health_check`.

## 13. Limpeza e manutenção

`item_delete` sem `keys` lista candidatos com o motivo (tag `archived` há mais de
90 dias, nunca aberto por 90 dias). Com `keys` mostra a prévia; só apaga com
`confirm=True`. Prefira a tag `archived` a apagar quando o histórico importa.
`knowledge-mcp report --json` traz o retrato (nunca abertos, arquivados, buscas
vazias, tags sem item): é a entrada do `/plumb-reflect`.

## 14. Trabalho (`work`) ativo: coordenação no próprio item

Vários agentes e sessões podem trabalhar no mesmo repositório. Para se enxergarem
sem abrir cada `work`, ele carrega a coordenação num padrão fixo (sem campo novo:
é o `summary`, o topo do `content` e as tags). O modelo completo está em
`spec-template.md`.

**`summary`** numa linha fixa: `<estado> · <fase n/total> · <branch> · <worktree> · <agente>`.
Estados: `Aguardando aprovação`, `Construindo`, `Provando`, `Parada`, `Concluída`
(`Concluída: <resultado em uma frase>`). Sem worktree, `sem worktree`.

**Topo do `content`**, uma por linha: `Trilha`, `Agente` (agente + sessão),
`Base`, `Branch`, `Worktree`, `Atualizado`; `Card` opcional.

**Tags de ciclo:** `draft` (aguardando aprovação), `active` (em andamento),
`done` (concluído); `worktree` enquanto houver worktree; mais 1 a 3 de área/tema.
Ao concluir, saem as de ciclo em andamento e `worktree`; ficam as de área.
As **áreas que a mudança toca** vão como `links` de tipo `{path}` (o mais estreito
possível): é com eles que se vê sobreposição entre mudanças.

**Ver o que os outros fazem:** `item_search(repo=".", types=["work"], tags=["active"])`
mostra o `summary` de cada um. Sobreposição de áreas (`{path}` dos links) com a
mudança nova vira pergunta do grill: sequenciar ou paralelizar.

**Link da UI:** o servidor devolve `url` em `item_save`, `item_get` e
`item_search`. Ao criar, atualizar e entregar um `work`, termine a mensagem ao
usuário com `Work: <url>`. Resposta sem `url`: não invente; diga a key.
