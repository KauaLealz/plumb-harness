# O segundo cérebro v7 — arquivos, estilo Obsidian, opcional

Memória durável em **markdown livre**, sem tipos fixos e sem regras de schema. Tudo funciona **com
e sem** o cérebro: se a pasta não existir, o agente segue. O `knowledge-os` (MCP) é **opcional** —
quando instalado, acelera busca/UI por cima dos mesmos arquivos; sem ele, leia os arquivos direto.

## Onde mora (duas camadas)

| Camada | Pasta | Vale para |
|---|---|---|
| **Projeto** | `.plumb/knowledge/` (commitado no repo) | aquele repositório; o time compartilha |
| **Global (pessoal)** | `~/.plumb/knowledge/` | você, em qualquer projeto (idioma, estilo, preferências) |

O agente enxerga **global + projeto atual** — nunca o `.plumb/` de outro repositório. **Regras de
empresa/cliente moram no próprio repo** (dentro de `.plumb/knowledge/`), não numa camada à parte.

## Layout

```
.plumb/knowledge/
  rules.md                      regras e convenções globais do projeto (poucas, densas)
  <área>/                       uma pasta por assunto/área quando o volume pede
    <item>.md                   um arquivo por item (uma decisão, uma pegadinha, um howto)
```

`~/.plumb/knowledge/` segue o mesmo formato. Comece com `rules.md`; crie subpastas de área quando
houver 2+ itens de um tema. Nada de pasta com 0–1 item.

## Formato de uma nota

Frontmatter com um **resumo de uma linha** + o corpo. O pacote do `SessionStart` carrega **só os
resumos**; o corpo entra sob demanda na leitura.

```markdown
---
summary: Estorno parcial recalcula o imposto proporcional — senão a nota fiscal sai errada.
tags: [pagamentos, decision]
---

# Estorno parcial

<o corpo: o porquê, a alternativa descartada, o exemplo, a pegadinha, com `arquivo:símbolo`>
```

- `summary` em 1–2 frases **com o porquê**. Se precisa do corpo para ser seguido, está fraco.
- `tags` livres (área + nuance: `decision`, `troubleshoot`, `security`, `pattern`…). Reaproveite as
  existentes em vez de criar variação (`pagamentos`, não `pagamento`).
- Ligações a outros itens ou a código: links markdown normais (`[estorno](pagamentos/estorno.md)`,
  `src/payments/Charge.java`).

## Ler

- **Antes de agir** (proporcional ao score): leia `rules.md` e as notas da(s) área(s) que a mudança
  toca, nas duas camadas. No trivial, pode pular.
- Como: leia os arquivos direto (Grep/Read na pasta `.plumb/knowledge/`); com `knowledge-os`
  instalado, use a busca dele.
- **Isolamento:** nunca cite/leve conhecimento de um projeto para o repositório de outro cliente.

## Gravar (via `plumb-learn`)

- **O que o usuário ditou** ("sempre X") grava **na hora**; o que **você inferiu** pede o "sim".
- **Destino pelo alcance:** específico do projeto → `.plumb/knowledge/<área>/`; transversal/pessoal
  → `~/.plumb/knowledge/` (global sempre pede o "sim").
- **Anti-duplicata:** leia a pasta antes de escrever; atualize o arquivo existente em vez de criar
  variação.
- **Não é nota:** bug (é trabalho → spec/card), medição datada, id de tarefa, o que o código ou o
  `AGENTS.md` mostram em segundos, como o Plumb funciona (já está nas instruções). Nunca segredo nem
  dado pessoal.
- **Item errado/velho:** corrija ou remova (é git).

## Override — adaptar à rotina do dev/empresa

Tudo que o harness formata (template de spec, formato de evidência, escada de prova, estilo de doc,
template de PR/commit, definição de pronto) é um **default sobrescrevível**. Precedência, do mais
forte ao mais fraco: **`.plumb/knowledge/` do projeto → global → default do harness**. Uma regra do
dev/empresa **vence** o default — o harness se adapta, não impõe.

## Indisponível

Se a pasta não existir ou não der para ler/escrever: avise em uma linha e siga. O que gravaria,
proponha ao usuário ou deixe na mensagem. Nunca trave o trabalho por causa do cérebro.
