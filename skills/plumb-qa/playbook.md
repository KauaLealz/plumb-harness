# Playbook do qa — como provar bem

A expertise do `plumb-qa`: a **escada de prova** e os padrões de cada natureza. É o que o `qa` lê
para saber o piso e como executá-lo.

## A escada de prova (piso por natureza — nunca abaixo, nunca só unitário)

| Natureza da mudança | Piso (prova mínima) | Como rodar · o que observar |
|---|---|---|
| Cosmética / UI sem lógica (cor, texto) | Verificação visual | screenshot ou abrir a tela; sem E2E completo |
| Lógica de negócio | Unitário cobrindo as bordas | zero, negativo, limites, arredondamento |
| Back-end (lógica/serviço) | **≥ teste de integração** | sobe o módulo/rota real; observa a resposta e o efeito |
| Back que impacta o front | **E2E do fluxo afetado** | navegador/execução real da jornada |
| Correção de bug | **Teste de regressão** que reproduziu a falha | ver falhar antes de corrigir, passar depois |
| Dados / migração | Rodar a **migração + rollback** em banco de teste | up, down e dados existentes |
| Filas / async | **Mensagem real** + idempotência + DLQ | produtor e consumidor; reentrega não duplica efeito |
| API interna | Integração: feliz + inválida + não autorizada | status e corpo |
| API pública / contrato | Teste de **contrato** + impacto no consumidor | compatibilidade; quebra → versionar |
| Auth / permissões | Permitido **e** negado | matriz papel × ação quando há papel novo |
| Pagamento | Cálculos (unit) + **uma execução ponta a ponta** | inclui o caminho de falha (estorno/conciliação) |
| Dados pessoais | Mascaramento, retenção, acesso; nada de PII em log | conferir o conteúdo exportado |
| Feature flag | Ligada **e** desligada | rollout gradual → os dois estados |
| LLM / qualidade subjetiva | **Evals** com casos fixos | segurança e formato da saída ao usuário |
| Dependência atualizada | Suíte + smoke + auditoria (`npm audit`, `pip-audit`) | major → revisar pontos de uso |
| Infra / IaC | Validação do IaC + smoke | rede/permissão → teste de conectividade |

## Compor o piso

- A mudança carrega 1–N naturezas (back + fila + UI…). O piso é a **união** delas: rode **todos** os
  pisos aplicáveis, não escolha um.
- **Escalar acima** do piso: pelo score (programa → ponta a ponta mais amplo) e pelo risco. Mudar a
  cor do botão não roda E2E; mexer no cálculo do estorno roda o caminho de falha também.

## Evals (quando há LLM/qualidade)

Para parte com LLM ou qualidade não-binária: uma suíte de **evals** com casos fixos (entrada →
critério de aceitação), rodada como gate — estilo Evalite (sobre o runner de teste do projeto).
Cubra casos de segurança (prompt injection, vazamento) e de formato.

## Longa duração (score 9–10)

Quando a mudança é um programa/greenfield: `feature_list.json` com cada resultado `"passes": false`
até provar E2E; `init.sh` para subir o ambiente; verificação E2E real por automação de navegador
antes de marcar pronto. "Clean state = mergeável."

## Pegadinhas

- Não teste código gerado nem biblioteca de terceiros.
- Teste instável nunca se ignora em silêncio: rode de novo uma vez e reporte.
- Ficar abaixo de um piso só com o "ok" explícito do usuário, registrado nas Notas da spec com o motivo.
- Override: piso/formato da empresa no `.plumb/knowledge/` vence este default.
