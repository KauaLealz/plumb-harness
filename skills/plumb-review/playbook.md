# Playbook do review — como revisar bem

A expertise do `plumb-review`: os **dois eixos**, a **lente de segurança** e como **calibrar a
severidade**. É o que o revisor lê para julgar um diff sem rodar nada. A régua é a spec + as
convenções do projeto (`.plumb/knowledge/`), nunca o gosto do revisor.

## O que preciso saber (1ª vez)

Antes do primeiro review num repo (ou com um dev novo), explore e, na dúvida, pergunte. O mecanismo
(explorar → perguntar → `plumb-learn`) está em `../plumb/references/preferences.md`. Dimensões:

| Dimensão | O que descobrir | Tende a ser |
|---|---|---|
| **Foco** | em que o dev quer que o review mire — bugs, segurança, performance, estilo (e o que **não** policiar) | **global** (jeito de revisar do dev) |
| **Limiar de severidade** | reporta nit/menor ou só major+? onde fica o corte do "não bloqueia" | **global** |
| **Fonte das convenções** | onde moram as regras do projeto (`.plumb/knowledge/`, `AGENTS.md`, lint/style, guia do time) | **projeto** (convenção do repo) |
| **Formato do veredito/relatório** | como o dev quer o veredito e os achados — tabela, por severidade, com `arquivo:linha`, onde registrar | **global** |

- **Projeto** (vence o global): a fonte das convenções e qualquer definição de pronto/critério da
  empresa — fato do repo, viaja com ele.
- **Global**: foco, limiar e formato — preferência pessoal do dev, viaja entre projetos.

## Eixo A — fidelidade à spec (ex-verify/converge)

Confronte o **diff** com os **resultados esperados** e o **combinado** da spec (no modo auditoria,
com a descrição do PR/card). Para cada item, classifique o gap:

| Classe | O que é | Exemplo |
|---|---|---|
| **faltando** | resultado esperado sem nada no código que o entregue | AC3 "notifica por e-mail" não aparece no diff |
| **parcial** | entregue pela metade: borda, caminho de erro ou estado faltando | trata sucesso do pagamento, não o de recusa |
| **contradiz** | o código faz o **oposto** ou quebra o combinado | combinou "sem estorno automático"; o diff estorna |
| **não pedido** | mudança fora do escopo da spec, sem pedido | refatorou um módulo vizinho, renomeou API pública |

- **faltando/parcial** costumam ser bloqueador/major; **contradiz** quase sempre é bloqueador;
  **não pedido** é risco (raio de impacto, revisão não combinada) — sinalize mesmo que o código
  esteja correto, porque amplia a mudança e o que o `qa` precisa provar.
- Olhe os `observa-se:` da spec: se nada no diff tornaria aquele critério observável, é `faltando`.

## Eixo B — correção + convenções

Procure **bug real** (com cenário de falha) e **desvio de convenção**. Checklist:

- **Correção:** bordas (vazio, nulo, zero, negativo, limite), off-by-one, condição invertida.
- **Concorrência/estado:** corrida, idempotência (reentrega/duplo clique), ordem de efeitos,
  transação que não cobre todos os passos.
- **Erros:** exceção engolida, erro genérico, recurso não liberado, retry sem limite/backoff.
- **Dados:** N+1, índice ausente, migração sem rollback, conversão de tipo/precisão (dinheiro em
  float), fuso/encoding.
- **Contrato:** mudança incompatível em API/evento sem versionar; quebra o consumidor.
- **Convenções:** desvios das `rule` do projeto, padrões da base, nomes, camadas, dead code,
  duplicação que já tinha utilitário.
- **Testes:** o diff muda comportamento sem teste que o cubra; teste que não falharia se o bug
  voltasse. (Você não roda — avalia se a cobertura existe e é honesta.)

## Lente de segurança (liga em área sensível)

Ligue quando o diff toca **auth/permissão, pagamento, dado pessoal, segredo, ou entrada externa**.
O que olhar em cada uma:

- **Auth / permissão:** toda rota/ação nova confere papel e dono do recurso? Autorização no
  servidor (não só na UI)? Escalonamento de privilégio? Caminho negado tratado?
- **Pagamento:** valor/sinal/arredondamento; idempotência da cobrança; o caminho de falha
  (estorno/conciliação); nada de confiar em valor vindo do cliente.
- **Dado pessoal:** PII em log/erro/resposta; mascaramento; retenção; acesso mínimo.
- **Segredo no diff:** chave/token/senha hardcoded, `.env` commitado, credencial em teste/fixture.
- **Entrada externa:** validação e sanitização; injeção (SQL/command/template), XSS, SSRF,
  path traversal, deserialização insegura; limite de tamanho/taxa.

Achado de segurança nasce como **major** no mínimo; exploração plausível → **bloqueador**.

## Calibrar a severidade

| Severidade | Critério | Exemplos |
|---|---|---|
| **bloqueador** | não pode entrar assim: perda/corrupção de dado, falha de segurança explorável, resultado esperado que `contradiz` ou está `faltando`, quebra de contrato | estorna quando combinou não estornar; rota sem authz; segredo no diff |
| **major** | bug real em caminho provável, ou parcial relevante, que deveria ser corrigido antes de seguir | caminho de recusa não tratado; N+1 em rota quente; PII em log |
| **menor** | correto mas melhorável; preferência/estilo/limpeza — **não bloqueia** | nome ruim, dead code, duplicação pequena, teste que podia cobrir mais |

- **Separe bug de preferência.** Preferência é sempre menor e vai rotulada como opinião.
- Calibre pelo **score e raio de impacto** da mudança: o mesmo deslize pesa mais em pagamento/
  produção/async do que num script interno.

## Achado = cenário de falha concreto

Todo bloqueador/major é "**quando** acontece X **com** entrada/estado Y, **então** Z (resultado
errado)", ancorado em `arquivo:linha`. Sem o cenário, não é achado — é palpite; rebaixe a menor ou
deixe de fora. Você não executa para confirmar: descreva o cenário que **exporia** a falha (é o
`plumb-qa` que roda).

## Pegadinhas

- Não revise a intenção que você imaginou — revise o que o diff faz (por isso o contexto fresco).
- Não reescreva o código no relatório; **não corrige** — descreve o problema e o usuário decide.
- Não afirme "funciona"/"quebra" por execução: isso é do `qa`. Aqui é leitura.
- Diff grande: priorize os arquivos de maior risco (área sensível, núcleo) antes do periférico.
- Override: convenção/critério da empresa no `.plumb/knowledge/` vence este default.
