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

## Custo: o tier de cada agente

Nenhum agente crava um modelo: todos herdam o da sessão, e o orquestrador aplica
o tier no despacho (parâmetro `model`), escolhendo entre os modelos que a
ferramenta oferece hoje.

| Tier | Para que serve | Quem |
|---|---|---|
| **rápido** | ler, buscar, rodar comando e reportar — capacidade extra não ajuda | explorador, testador |
| **equilibrado** | escrever código dentro de uma fase já definida | implementador |
| **capaz** | escolher o que construir, achar bug sutil | planejador, revisor |

Suba o implementador para **capaz** na trilha profunda ou depois de uma falha na
mesma fase. Cada despacho novo relê o código do zero: despache **por fase**, não
por tarefa solta.
