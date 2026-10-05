# Sinais de retroalimentação

Anote cada sinal em uma linha na seção `## Retro` do plano (no `content` do item
`mudanca/<id>`; junte as linhas e grave com a próxima atualização do plano), na hora:
`- <tipo>: <o que aconteceu> — <evidência>`. Custa uma linha e alimenta o
fechamento e a `/plumb-retro`.

| Tipo | Quando | O que fazer |
|---|---|---|
| `regra` | O usuário enuncia uma diretriz ("sempre…", "nunca…", "aqui a gente…", "a partir de agora…") | **Na hora:** grave pelo molde (`brain-items.md`) e confirme em uma linha |
| `decisão` | O usuário decide algo com um porquê que vale além desta mudança | Anotar |
| `correção` | O usuário corrige algo que você fez | Anotar |
| `rejeição` | Um gate é rejeitado por um motivo que vale além desta mudança | Anotar |
| `travamento` | A regra do travamento disparou | Anotar |
| `retrabalho` | Um T-fix nasceu de algo que um critério ou checklist teria pego | Anotar |
| `procedimento` | Você executou passos que vão se repetir (migration, endpoint novo, release) | Anotar |
| `padrão novo` | Esta mudança fez algo pela primeira vez no projeto (primeiro endpoint, migration, componente, job, tratamento de erro) | Anotar, com o arquivo que virou modelo |
| `fato velho` | Um comando do `AGENTS.md` ou um item do cérebro não vale mais | Anotar |
| `lacuna` | Faltou uma capacidade (estado do banco, verificar UI, ler o ticket) | Procure em `../plumb-setup/references/catalog.md`; se não houver, a skill `plumb-find-skills`. Sugira **uma vez** — skill de terceiro só entra depois da revisão de segurança dela e do "sim" |

## Fechamento

Antes de arquivar, trate os sinais da Retro ainda não tratados:

- **1 ou 2 sinais simples** (`regra`, `decisão`, `travamento` já resolvido,
  `fato velho`): monte você mesmo os itens pelo molde e grave num `item_save`.
- **3 ou mais, `padrão novo` ou `procedimento`:** **um** despacho do
  `plumb-curator` com todos os sinais, as Decisões, o pacote que você já tem e o
  caminho absoluto de `brain-items.md` (o molde).
  Nunca um despacho por sinal.
- Antes de gravar, o item já existe e foi ignorado? O problema é de aderência
  (falta o porquê, um exemplo, `keywords` ou `scope_paths`), não de regra faltando.
- Itens entram `working`, sem perguntar. Na entrega, uma linha "Guardei para as
  próximas vezes: …" diz o que foi guardado, em linguagem humana. Promoção a
  `longterm`/`canonical` fica para a `/plumb-retro` — não pergunte na entrega.
  Edição no `AGENTS.md` (um comando que mudou): faça e diga na entrega.
- Erro de gravação: corrija a entrada que o erro aponta e grave de novo.
- Feche a Retro com `Números:` (formato no modelo da mudança).
