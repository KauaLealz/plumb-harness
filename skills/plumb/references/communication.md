# Comunicação e custo: exemplos

## Como soa (tom das mensagens ao usuário)

| Momento | Como soa |
|---|---|
| Abertura (1–2 linhas) | `Entendi: o checkout passa a aceitar Pix e devolver o QR code. Como mexe no contrato da API de pagamentos, antes de mexer no código vou te fazer algumas perguntas e montar uma spec curta.` |
| Correção rápida | `É uma correção pequena — vou direto: reproduzir com um teste, corrigir e te mostro.` |
| Retomada | `Retomando o Pix no checkout, no mesmo espaço de trabalho de antes: o QR code já funciona; falta tratar método inválido.` |
| Andamento | `✓ Pagamento com Pix devolve o QR code — testes 5 de 5.` e, se houver próximo passo: `→ Agora: recusar método de pagamento desconhecido (2 de 3).` |
| Revisão | `Pedi a um revisor independente para conferir o código, com atenção extra à segurança porque é pagamento.` |
| Travou | `Travei: o teste de integração precisa de um banco que não sobe aqui. Tentei X e Y. Opções: …` |
| Aprendizado guardado | `Guardei para as próximas vezes: valores em pagamentos são sempre centavos inteiros (vale em src/payments).` |

## Custo: dimensionar cada despacho

Dois botões, e eles ficam em lugares diferentes:

| Botão | Onde vive | Quem muda |
|---|---|---|
| **modelo** | o parâmetro `model` do despacho | **você**, a cada chamada |
| **esforço** | o campo `effort` do arquivo do agente | fixo por papel — a ferramenta de subagente não aceita `effort` por chamada |

Por isso nenhum agente crava modelo (`model: inherit`): a sessão pode rodar num
modelo forte como orquestrador enquanto cada despacho desce para o mais barato
que dá conta. O esforço já vem calibrado para o papel; o que você dimensiona a
cada chamada é o modelo.

| Agente | Modelo padrão | `effort` | Por quê |
|---|---|---|---|
| `plumb-explorer` | `haiku` | low | ler, buscar e citar `arquivo:linha` — capacidade extra não acha mais coisa |
| `plumb-scout` | `haiku` | low | consultar documentação ou catálogo e resumir |
| `plumb-tester` | `sonnet` | medium | rodar a suíte é mecânico, mas ligar cada resultado esperado à evidência certa não é |
| `plumb-implementer` | `sonnet` | medium | escrever código dentro de uma fase já decidida |
| `plumb-planner` | `opus` | high | escolher o que construir; erro aqui custa a mudança inteira |
| `plumb-reviewer` | `opus` | high | achar o bug sutil que passou por todo mundo |
| `plumb-dreamer` | `sonnet` | medium | separar o que dura do que é andamento, com a evidência do turno |

**Suba um nível** (`haiku`→`sonnet`→`opus`) quando:

- a trilha é **profunda** — implementador e testador sobem;
- a área é **sensível** (`rule/security`, auth, pagamento, dado pessoal, tenant,
  segredo) — revisor e implementador sobem;
- a **mesma fase falhou uma vez** — o implementador sobe no reenvio;
- o retorno veio **fora do formato** ou ignorou uma restrição — suba e redespache,
  em vez de repetir no mesmo nível.

**Desça um nível** quando o trabalho é mecânico e verificável por comando: reenvio
só para aplicar uma correção já descrita, releitura de um arquivo, conferência de
um comando. Na **trilha direta**, o revisor roda em `sonnet`: o diff é pequeno e o
custo tem que caber numa correção de minutos.

Modelo que a ferramenta não oferece hoje: use o mais próximo para cima, nunca para
baixo. Cada despacho novo relê o código do zero — despache **por fase**, não por
tarefa solta.
