# Playbook do document — como documentar bem

A expertise do `plumb-document`: documentar o **comportamento atual** para humanos, fiel ao código,
no lugar e no formato certos. É o que o `document` lê para saber **o que** escrever e **o que não**.

## A regra de ouro: comportamento observável, não intenção

Documente o que uma pessoa **vê acontecer**, não o que o autor quis:

- **Sim:** "`POST /refunds` com `amount` maior que o saldo retorna `422` com `{error: "insufficient"}`."
- **Não:** "o endpoint de estorno valida o saldo para garantir integridade financeira." (isso é
  intenção/porquê — vai pro cérebro, não pra doc).

Regras práticas:
- Descreva **entrada → saída → efeito → erro**. Nomeie flags, env vars, parâmetros e defaults como
  **existem no código**, não como "deveriam" existir.
- Verbo no **presente** ("retorna", "cria", "ignora"), nunca futuro ("vai suportar", "em breve").
- Sem roadmap, sem histórico de versões antigas, sem "antes era assim", sem menção a legado a
  remover. A doc é uma **foto do agora**.
- Todo exemplo é **real**: um comando/trecho que você rodou ou leu no código. Exemplo inventado é bug
  de documentação.

## A fronteira doc ↔ `.plumb/knowledge/`

Duas coisas diferentes, dois destinos. Nunca misture.

| | **Doc** (README, `docs/`) | **Cérebro** (`.plumb/knowledge/`) |
|---|---|---|
| Para quem | humanos que **usam/operam** o sistema | o **agente** (e o time), ao trabalhar nele |
| O que | **o quê** e **como usar** — comportamento atual | **o porquê**, convenções, decisões, pegadinhas |
| Exemplo | "como rodar", "quais endpoints", "o que cada flag faz" | "por que escolhemos fila em vez de cron", "sempre Money, nunca number" |
| Onde mora | **no repositório** (versionado com o código) | `.plumb/knowledge/` (projeto) + `~/.plumb/knowledge/` (global) |

- Documentando, você **consulta** o cérebro para acertar termos e não contradizer uma decisão — mas
  o porquê **não entra na doc**.
- Descobriu um porquê/decisão durável enquanto documentava? Mande pro cérebro via **`plumb-learn`**
  (ele decide alcance e pede o "sim" no inferido). Não grave nada no cérebro por conta própria aqui.

## Estrutura

### README (porta de entrada)
Ordem que respeita a leitura de quem chega:
1. **O que é** — uma frase: o que o projeto faz e para quem.
2. **Como rodar** — pré-requisitos, instalação, subir local, variáveis mínimas. O caminho mais curto
   até "funcionando".
3. **Uso básico** — o exemplo mais comum, de ponta a ponta, copiável.
4. **Configuração** — flags/env vars que importam, com default e efeito.
5. **Ponteiros** — onde fica o resto (docs/, comandos, contribuição). Não repita o que está em `docs/`.

Mantenha o README curto; detalhe mora em `docs/`.

### Guia de uso (`docs/`)
Orientado a **tarefa** ("como fazer X"), não a arquivo: passo a passo, pré-condição, resultado
esperado, erros comuns e o que fazer. Um exemplo completo e rodável por guia.

### Referência (API, CLI, config)
Orientada a **completude**: cada endpoint/comando/opção com entrada, saída, erros e um exemplo.
Tabela quando couber. Gere/derive do código ou do schema sempre que der, para não divergir.

### Comentários de alto nível (no código)
Só o que o código não diz sozinho: o contrato de um módulo, invariantes, o "o quê" de uma peça não
óbvia. Não narre linha a linha; não duplique o que o nome da função já diz.

## Atualizar doc que já existe

- **Case com o existente:** mesmo tom, mesma estrutura, mesmos termos. Não reescreva o estilo sem
  motivo.
- **Corrija o defasado:** afirmação que não bate mais com o código é o alvo nº 1 — some ou conserte.
- **Não deixe órfão:** removeu uma flag/endpoint do código? Tire da doc também. Links quebrados e
  exemplos que não rodam mais são defeito.

## Respeite o template da empresa

Se o `.plumb/knowledge/` traz um **template/estilo de doc** (seções obrigatórias, tom, formato de
exemplo, convenção de títulos), ele **vence** esta estrutura-padrão (precedência projeto → global →
default). Siga a deles; a estrutura acima é só o fallback quando não há um.

## Provar a doc

- Rode o que der: link checker, `markdownlint`, o build da doc, e — principalmente — **rode os
  exemplos** que você escreveu (um comando que não roda é pior que nenhum).
- Sem ferramenta: releia e confira **afirmação por afirmação** contra o código. Na dúvida sobre um
  comportamento, volte ao código em vez de chutar.

## Pegadinhas

- Não documente o comportamento **pretendido** de um PR ainda não mergeado — documente o que está na
  base.
- Não copie docstring desatualizada como verdade: confirme no código.
- Não vaze segredo nem dado pessoal em exemplos (use valores fictícios óbvios).
- Não transforme a doc em changelog nem em registro de decisão — isso é cérebro (`plumb-learn`).
