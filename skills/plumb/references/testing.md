# Escolhendo o nível dos testes

Use quando a mudança toca API, banco, serviço externo, auth, pagamento,
dados pessoais ou fluxo crítico. Para lógica de negócio simples, um teste
unitário por critério basta — este arquivo não é necessário.

## Princípios

- **Reusar → estender → criar.** Rode o teste que já cobre o comportamento;
  estenda se estiver perto; crie um novo só se nenhum dos dois der a prova.
- **Um comportamento, um nível.** Prove cada critério no nível que a tabela
  indica, não em unitário *e* E2E. Ponta a ponta cobre o caminho feliz e a
  falha mais cara, nada além.
- **Bug ganha teste de regressão** no nível em que apareceu, e você o vê
  falhar antes de corrigir.
- **Use as ferramentas que o projeto já tem.** Ferramenta de teste nova não
  entra dentro de uma feature — proponha à parte.
- **Teste instável:** rode de novo uma vez. Passando ou não, reporte como
  instável; nunca ignore em silêncio.
- Não teste código gerado nem biblioteca de terceiros.

## Prova mínima por contexto

| Contexto | Mínimo | Reforce quando |
|---|---|---|
| Lógica de negócio | Unitário | Regra financeira ou legal → bordas (zero, negativo, limites, arredondamento) |
| Correção de bug | Teste de regressão que reproduziu a falha | — |
| Refatoração / legado | Suíte atual verde; testes de caracterização onde faltar | Só na área tocada |
| API interna | Integração: caminho feliz + entrada inválida + não autorizado | Usada por outro time → teste de contrato |
| API pública / SDK | Contrato + compatibilidade | Quebra de compatibilidade → versionar |
| Banco / schema | Integração com banco real (container ou banco de teste) | Migration → up, down e dados existentes |
| Serviço externo | Stub/mock: caminho feliz + a falha mais cara (timeout, 5xx, resposta malformada) | Fluxo com estado → conferir a requisição enviada, não só o tratamento da resposta |
| Filas / eventos | Produtor e consumidor | Ordem, idempotência, retry |
| Auth / permissões | Permitido **e** negado | Papel novo → matriz papel × ação |
| Pagamento | Unitários dos cálculos + uma execução ponta a ponta | Estorno/conciliação → também o caminho de falha |
| Dados pessoais | Mascaramento, retenção, controle de acesso; nada de dado pessoal em log | Exportação → conferir o conteúdo exportado |
| Feature flag | Ligada e desligada | Rollout gradual → os dois estados ponta a ponta |
| Só UI | Teste de componente | Mudança de navegação → uma jornada |
| Feature com front e back | Uma jornada ponta a ponta | Fluxo crítico → também a falha mais cara |
| Funcionalidade com LLM | Evals com casos fixos | Saída ao usuário → casos de segurança e formato |
| Dependência atualizada | Suíte + smoke + auditoria (`npm audit`, `pip-audit`…) | Versão major → revisar pontos de uso |
| Infra / config | Validação do IaC + smoke | Rede/permissão → teste de conectividade |
| Só texto / docs | Nenhum | Texto num fluxo crítico → rodar a jornada existente |

Ficar abaixo de um mínimo só com o "ok" explícito do usuário, registrado em
Decisões com o motivo.