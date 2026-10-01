# Contrato de prompt para subagentes

Um subagente começa do zero: não vê a conversa, não sabe o que foi decidido
e não pode perguntar nada ao usuário. Tudo o que ele precisa tem que estar
no prompt. O arquivo do agente (`plumb-*.md`) já traz o papel, as regras
fixas e o formato de saída — o seu prompt traz **só o que muda a cada
chamada**, sem repetir o que o arquivo do agente já diz.

## Estrutura

Use estas seções, nesta ordem, com as tags. Omita uma seção apenas se ela
realmente não se aplica.

```
<objetivo>
Uma frase, um único objetivo, com o resultado esperado.
</objetivo>

<contexto>
- Projeto: stack e comandos relevantes (dos fatos do projeto).
- Mudança: id, caminho do arquivo da mudança, trilha.
- Decisões já tomadas que afetam este trabalho, com o porquê.
- O que já está pronto (tasks concluídas, achados anteriores).
- Arquivos e símbolos relevantes, com caminho a partir da raiz.
</contexto>

<tarefa>
Passos concretos, ou a pergunta exata a responder.
</tarefa>

<restricoes>
Escopo permitido (arquivos), o que não fazer e por quê.
</restricoes>

<criterio_de_pronto>
Como o subagente sabe que terminou: comando + resultado esperado.
</criterio_de_pronto>

<se_travar>
Quando parar e o que devolver em vez de insistir.
</se_travar>
```

## Checklist antes de despachar

- [ ] Alguém sem acesso à conversa entenderia o pedido só com este texto?
- [ ] Os caminhos são explícitos (nada de "aquele arquivo", "o módulo de antes")?
- [ ] As decisões do usuário que mudam o resultado estão incluídas?
- [ ] O escopo está fechado (lista de arquivos ou área)?
- [ ] O critério de pronto é verificável por comando?
- [ ] Um objetivo só? Dois objetivos → dois despachos.
- [ ] Está no idioma do usuário?

## Exemplo — implementador

Ruim (o subagente vai adivinhar quase tudo):

```
Implementa a T2 do PAY-142.
```

Bom:

```
<objetivo>
Fazer o webhook recusar pagamentos Pix confirmados depois do prazo de 30 minutos (T2 do PAY-142).
</objetivo>

<contexto>
- Projeto: Node 20, testes com `node --test`; lint `npm run lint`.
- Mudança: .plumb/changes/PAY-142.md (trilha padrão). T1 pronta: `isExpired(payment, now)` existe em src/payments/pix.js, com testes.
- Decisão do usuário: recusar com motivo `expired`, sem estorno automático — o estorno manual já existe e o financeiro quer revisar caso a caso.
- O webhook fica em src/payments/webhook.js (handleConfirmation, linha ~40) e também atende cartão.
</contexto>

<tarefa>
1. Em tests/webhook.test.js, escreva o teste do AC2: Pix criado há 31 min, confirmação chega → status `rejected`, motivo `expired`. Rode e confirme que falha.
2. Em handleConfirmation, use isExpired para recusar Pix vencido. Não mude o caminho do cartão.
3. Rode a verificação.
</tarefa>

<restricoes>
Só src/payments/webhook.js e tests/webhook.test.js. Não refatore o handler — ele é compartilhado e a refatoração está fora do escopo.
</restricoes>

<criterio_de_pronto>
`node --test tests/webhook.test.js` passa, incluindo os testes de cartão já existentes.
</criterio_de_pronto>

<se_travar>
Se precisar mexer em outro arquivo, pare e devolva `escopo` dizendo qual e por quê. Se o mesmo teste falhar do mesmo jeito duas vezes, devolva `travado` com o que tentou.
</se_travar>
```

## Ao receber o retorno

- Confira contra o critério de pronto — rode o comando você mesmo quando
  for barato.
- Retorno fora do formato do agente, ou que ignorou uma restrição: não
  aceite em silêncio. Corrija o prompt e despache de novo, ou faça você
  mesmo e avise o usuário.