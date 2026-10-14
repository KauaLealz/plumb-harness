# Modelo padrão de organização do cérebro

`brain.md` é o contrato do servidor: que ferramentas existem, que campos um item
tem, o que cada tipo significa. **Este arquivo é a resposta operacional**: dado o
que acabou de acontecer no trabalho, isto vira item? De que tipo? Com que key?
Onde mora, para quem vale, com que tags e que sinônimos? Relaciona com o quê?

Leia junto com `brain.md`, uma vez por sessão, antes da primeira gravação.
Quando os dois divergirem, `brain.md` vence no contrato (nomes de ferramenta,
campos) e este vence na escolha (tipo, lugar, nome).

## 1. A forma que um projeto bem organizado tem

Um repositório maduro no cérebro tem, em regime, mais ou menos isto — e quase
nada além disto:

| Faixa | Itens típicos | Sinal de problema |
|---|---|---|
| `context/*` | 3 a 6, sempre os mesmos: `context/product`, `context/stack`, `context/map`, `context/environment`, às vezes `context/glossary` | 10 contextos = alguém está usando `context` como diário |
| `rule/*` | 5 a 30, crescendo devagar | 100 regras = ninguém lê nenhuma; várias são a mesma com nomes diferentes |
| `howto/*` | 3 a 20, cada um com comandos exatos | howto que ninguém abriu em 90 dias costuma estar desatualizado |
| `spec/*` | as vivas, mais o histórico concluído | spec `active` parada há mais de 3 dias é órfã |
| `secret/*` | poucos, sempre vazios | qualquer valor dentro é incidente |

A raiz é sempre a mesma: **quem lê o item age diferente por causa dele**. Se não
age, não é item.

### Os quatro contextos que todo projeto deveria ter

Faltando um destes, o setup está incompleto — e é a primeira coisa a propor
quando um deles não existe:

- `context/product` — o que o produto é e quem usa. Sem isso, toda decisão de
  escopo vira chute.
- `context/stack` — linguagem, framework, versões, ferramentas e **os comandos**.
- `context/map` — por onde se entra no código: as 5 a 10 pastas que importam e o
  que cada uma responde.
- `context/environment` — como subir e rodar, com os links de onde isso é descrito.

## 2. Nome: a key

`<tipo>/<nome>`, minúscula, hífen, **no idioma do usuário**, pelo **assunto**, nunca
pelo evento que a criou.

| Em vez de | Use | Por quê |
|---|---|---|
| `rule/decisao-reuniao-outubro` | `rule/estorno-parcial` | a data morre; o assunto fica |
| `howto/corrigir-bug-do-pix` | `howto/pix-qr-nao-gera` | o próximo vai procurar pelo sintoma |
| `rule/padrao-2` | (a mesma key de antes) | sufixo numérico é duplicata disfarçada |
| `rule/pay-142` | `rule/metodo-pagamento-invalido` | id de card não é assunto |

Nome bom responde "sobre o que é?" sem abrir. Se você precisa do `content` para
saber do que a key fala, troque o nome **antes** de gravar — key de item que já
existe nunca muda.

## 3. Situação → o que vira item

A tabela é o coração deste arquivo. Olhe a coluna da esquerda, ache o que
acabou de acontecer, grave o que a linha manda.

| Aconteceu no trabalho | Vira | Grava |
|---|---|---|
| O usuário disse "sempre…", "aqui a gente…", "nunca…" sobre **código** | `rule/code` | na hora, `origin=user` |
| O usuário respondeu uma regra do **negócio** no grill (prazo, limite, quem pode, o que acontece quando) | `rule/business` | **na hora**, `origin=user` — não deixe morrer no Combinado da spec |
| O usuário disse como o **time trabalha** (revisão, branch, release, quem aprova) | `rule/process` | na hora, `origin=user` |
| Escolhemos entre dois caminhos plausíveis | `rule/decision` | com o porquê **e a alternativa descartada**; na profunda, sai do Design da spec |
| O explorador achou a convenção que o código **de fato** segue, com repetição em 3+ arquivos | `rule/code` | direto, `origin=code`, com `arquivo:linha` no `content` |
| Área sensível: auth, autorização, pagamento, dado pessoal, tenant, segredo | `rule/security` | sempre marcado como tal — é o que liga a lente de segurança depois |
| Descobrimos o molde que todo artefato de um tipo segue (toda página de listagem, todo caso de uso) | `rule/pattern` | com `Arquivo-modelo:` e a lista do que o molde tem |
| Travamos e destravamos por algo não óbvio | `howto/troubleshoot` | `## Sintoma`, `## Causa`, `## Solução`, com a mensagem de erro literal nas `keywords` |
| Uma sequência de passos se repetiu (publicar, migrar, rodar o seed, girar credencial) | `howto/procedure` | com os **comandos exatos**, não a descrição deles |
| Entendemos o que o produto é, ou para quem | `context/product` | atualize o item existente; não crie outro |
| Descobrimos a stack, a versão ou o comando de verdade | `context/stack` | mesma key, sempre |
| Mapeamos por onde se entra no código | `context/map` | mesma key; só as pastas que importam |
| Aprendemos a subir o ambiente | `context/environment` | com os links |
| O time usa uma palavra com sentido próprio (`conta`, `assinatura`, `lote`) | `context/glossary` | um item só, todas as palavras |
| Apareceu token, senha ou chave | `secret/<nome>` | item **vazio**; mande o `fill_url` ao usuário |
| A mudança foi planejada | `spec/<id>` | `draft` → `active` → `done` |
| Um bug, uma dívida, "depois a gente arruma" | **nada** | é card ou spec, não conhecimento |
| Andamento ("falta o teste", "está na branch X") | **nada** | vai no `summary` da spec |
| Medição de hoje (7 testes, 3 erros de lint) | **nada** | Notas da spec, ou `ttl_days` |
| O que o código ou o `AGENTS.md` respondem em 10 segundos | **nada** | o cérebro não é espelho do repositório |
| Como o Plumb ou o próprio cérebro funcionam | **nada** | já está nas instruções |

## 4. Para quem vale: o alcance

Pergunte **"quem mais precisa disto?"** antes de escolher onde mora.

| Vale para | scope | Mora |
|---|---|---|
| só este repositório | `scoped` (omita) | o project do repositório |
| todos os repositórios desta empresa ou cliente | `workspace` | um project `compartilhado` do workspace — ou o próprio project, com `scope` no item |
| o usuário em qualquer lugar: idioma, estilo, máquina, ferramenta | `global` | o project `preferencias` do workspace pessoal |

Regras práticas:

- **Na dúvida, o mais estreito.** Subir o alcance depois é uma regravação;
  descer já envenenou outros repositórios.
- **A terceira repetição promove.** A mesma regra escrita em três repositórios do
  mesmo contexto não são três regras: é uma `workspace`. Proponha a promoção
  (regravar com `scope` maior e apagar as cópias) quando perceber.
- **Nada de pessoal numa conexão compartilhada:** preferência de idioma, de
  estilo de commit, de editor vai no workspace pessoal, nunca num project de
  cliente.
- `scope_paths` **sempre**, o mais estreito que for verdade (`src/payments/**`).
  Sem ele, a regra aparece em toda sessão do projeto e vira ruído — e ruído é o
  que faz o leitor parar de ler o pacote.

## 5. Para ser achado: resumo, sinônimos, tags

Três campos decidem se o item será encontrado daqui a dois meses. **Nenhum item
grava sem os três.**

- **`summary`** — 1 a 2 frases no imperativo **com o porquê**. Teste: dá para
  seguir a regra lendo só o resumo? Se precisa abrir o `content`, o resumo está
  fraco. `Valores em pagamento são centavos inteiros, nunca float — arredondamento
  de float já gerou diferença de caixa.`
- **`keywords`** — 4 a 8, e a pergunta não é "como eu chamo isto?", e sim **"o que
  outra pessoa digitaria?"**: o termo do dia a dia, o nome em inglês, a mensagem de
  erro literal, o nome da biblioteca, o apelido do time. Nunca repita o título.
  Achou um item por um sinônimo que não estava lá? Acrescente o sinônimo.
- **`tags`** — 1 a 3, do vocabulário existente (`tag_list` **antes**). Área
  (`pagamentos`, `auth`) ou tema transversal (`lgpd`, `performance`). Mais de 3 é
  item grande demais, ou tag que deveria ser `subject`.

E `links` quando existe algo fora: o card, a página da documentação que o batedor
leu, o dashboard. Link é mais barato que transcrever, e não envelhece junto.

### 5b. A forma canônica da tag

Tag sem forma definida nasce torta na primeira vez e nunca mais se conserta:
`pagamento`, `pagamentos` e `payments` viram três recortes do mesmo assunto, e
nenhum deles traz tudo. A forma é fixa:

| Regra | Sim | Não |
|---|---|---|
| substantivo no **plural** (coisas contáveis) | `pagamentos`, `webhooks` | `pagamento`, `webhook` |
| **idioma do usuário**, salvo termo que o time só fala em inglês | `assinaturas`, `auth` | `subscriptions` |
| minúscula, uma palavra; composta com hífen | `dados-pessoais` | `Dados Pessoais`, `dadosPessoais` |
| o **assunto**, nunca o tipo nem a tecnologia | `checkout` | `regras`, `decisoes`, `react`, `postgres` |
| sem sigla que só uma pessoa entende | `lgpd` (o time usa) | `fp`, `v2x` |
| tema transversal entra como tema | `performance`, `lgpd` | `performance-pagamentos` (duas tags, não uma) |

**Fusão, sempre que você vir a variação** — não é tarefa de faxina, é na hora:

1. `tag_list` **antes** de dar tag a qualquer item. A lista é curta de propósito:
   leia inteira.
2. Achou a variação (singular/plural, inglês/português, com e sem hífen)? Funda
   na canônica com `tag_update` (renomear leva os itens junto) e use a canônica
   no item que você ia gravar.
3. `item_save` com tag nova cria e devolve aviso com a parecida: **o aviso é a
   fusão pedindo para acontecer** — regrave com a existente em vez de deixar as
   duas.
4. Criar tag nova de propósito (`tag_create`) só quando o assunto não existe no
   vocabulário **e** vai aparecer de novo. Na dúvida entre criar e reusar a
   parecida, reuse: tag estreita demais não é achada por ninguém.
5. Vocabulário inteiro vazio (projeto recém-ligado): não invente na hora — o
   `/plumb-setup` semeia de 5 a 10 tags de área a partir do que o repositório
   realmente tem. Sem setup feito, crie a primeira pela forma acima e avise.

## 6. Agrupar: quando nasce um `subject`

`subject` é onde o item **mora**; tag é do que ele **fala**. Subject nasce tarde e
por volume:

1. Conte os itens da área no project (`item_search` por tag ou por `scope_paths`).
2. **3 ou mais** itens da mesma área, e o time usa aquele nome falando
   (`pagamentos`, `onboarding`, `importador`)? Proponha o subject pela ferramenta
   de perguntas e, com o "sim", mova os itens (`item_save` com o `id` e o
   `subject` novo).
3. **Nunca** crie subject com 1 ou 2 itens, nem um que repita o tipo (`regras`,
   `decisões`) ou a tecnologia (`react`): isso é tag, ou nada.
4. Item que caberia em dois subjects = recorte errado. Prefira deixar fora.

## 7. Ligar: as relações que o próprio trabalho produz

Grafo vazio é cérebro sem profundidade: cada item vira uma ilha e a busca é a
única porta. Relação decorativa é pior que nenhuma — mas, na prática, o erro que
acontece é o outro: ninguém cria nada, porque "na dúvida, não relacione" é fácil
de obedecer e não custa nada no momento.

**Duas perguntas, toda vez que você grava.** Não são opcionais, e a resposta
costuma ser sim:

1. **"Que item que já existe o leitor deste aqui precisaria abrir para agir
   certo?"** — achou um, a relação é esse. Achou nenhum **depois de procurar**
   (`item_search` pelo tema, `item_graph` em volta do item mais próximo), tudo
   bem: siga.
2. **"Esta é a terceira vez que falamos disso?"** — se é, o problema não é falta
   de relação, é item faltando ou errado: ou existe um item mais geral que os
   três deveriam apontar (`implements`), ou os anteriores estão superados
   (`supersedes`).

**Fechar uma mudança padrão ou profunda sem nenhuma ligação nova é suspeito**, não
é normal: uma mudança que não toca nada do que já estava guardado ou está
isolada de verdade (raro), ou o cérebro não foi consultado como devia. Não invente
uma ligação para cumprir tabela — volte e confira se a consulta da fase 2
realmente aconteceu.

Estas quatro nascem do trabalho normal — crie-as sem cerimônia, porque a
evidência está na própria mudança:

| Quando | Relação |
|---|---|
| a spec concretizou uma regra ou decisão existente | `spec/<id>` **implements** `rule/<x>` |
| a mudança seguiu um procedimento guardado | `spec/<id>` **depends_on** `howto/<x>` |
| a decisão nova substitui uma anterior | `rule/<novo>` **supersedes** `rule/<velho>` (o antigo vira `archived`) |
| o troubleshoot só faz sentido depois de um procedimento | `howto/<a>` **depends_on** `howto/<b>` |

`related_to` é o default fraco e quase sempre o errado: se a única coisa que você
consegue dizer é "tem a ver", `keywords` e tags já cobrem. Mas repare que isso
vale para o **tipo** da relação, não para criar ou não: antes de desistir, veja
se o caso não é um dos quatro acima — costuma ser. Antes de mudar um item que já
tem vizinhos, `item_graph` para ver quem quebra junto.

## 8. Antes de gravar: o mínimo que não se pula

Um `item_save` só sai com:

- [ ] `key` pelo assunto, no padrão, **procurada antes** (`item_get` pela key e
      `item_search` pelo tema — existe? atualize pela mesma key)
- [ ] `summary` com o porquê
- [ ] `content` com o modelo do subtipo (decisão: alternativa descartada;
      troubleshoot: sintoma/causa/solução; pattern: arquivo-modelo)
- [ ] `keywords` (4–8, o que outra pessoa digitaria)
- [ ] `scope_paths` estreito
- [ ] 1 a 3 `tags` do vocabulário existente, na forma canônica (§5b), com
      `tag_list` consultado antes e a variação fundida se houver
- [ ] as **duas perguntas** da §7 respondidas: que item o leitor precisaria abrir,
      e se esta é a terceira vez que o assunto aparece
- [ ] `origin` certo: `user` (ditado), `code` (inferido com `arquivo:linha`),
      `agent` (o resto)
- [ ] `source`: commit, `spec/<id>` ou "pedido do usuário AAAA-MM-DD"
- [ ] os `warnings` da resposta **lidos e corrigidos na mesma sessão**

## 9. Grava direto ou pede o "sim"

| Grava na hora, avisa em uma linha | Pede o "sim" pela ferramenta de perguntas |
|---|---|
| o que o usuário **ditou** (`origin=user`), em qualquer tipo | o que você **interpretou**: `rule/pattern`, `rule/decision` que não estava na spec, `context`, `howto` que você deduziu |
| convenção do código com **evidência de repetição** (3+ arquivos, `arquivo:linha`, `origin=code`) | qualquer item com `scope=global` |
| a `spec` que o usuário já aprovou | workspace, project, subject ou tag **novos**; mover item; promover alcance |
| as quatro relações da seção 7 | `supersedes` entre itens que o usuário ditou |
| `item_feedback` | `item_delete` |
| `status: review` em item que o trabalho contradisse, com a evidência | — |

Regra de bolso: **fato observável grava; interpretação pergunta.** Um item errado
envenena todas as sessões seguintes, e esperar cinco segundos não custa nada.

## 10. Manutenção contínua (barata, a cada fechamento)

Auditoria completa é do `/plumb-dream`. No dia a dia, uma coisa só por mudança:

1. Converta em `item_feedback` o que os subagentes devolveram em "Do cérebro"
   (`helped`, `irrelevant`, `verified`, `wrong`/`outdated`).
2. Olhe **um** candidato de limpeza: item que o pacote trouxe e nunca serviu, item
   em `review` há semanas, duas tags que são a mesma palavra. Proponha a correção
   em uma linha, com o "sim" — ou nada, se não houver.
3. Área que passou de 3 itens? Proponha o `subject` (seção 6).

Nada disso vira uma rodada de perguntas: é **uma** linha na entrega, quando houver
o que dizer.
