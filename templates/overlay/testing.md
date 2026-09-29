# Testing policy

Default reference, covering every context the plan defines. The
`plumb-init` interview trims this down to only the contexts actually present
in the project, fills in the critical flows, the per-level commands, and the
crystallization setting. Dream cycles may adjust minimums with evidence.

## Levels

| Nível | Ferramenta | Fase |
|---|---|---|
| Unitário, regressão e caracterização | Framework do projeto, em TDD | implement |
| Integração e contrato de API | Cenários Hurl com casos negativos; estado conferido pelo Nautilus | verify |
| Dependências externas | Stubs do WireMock, com caminho feliz e falhas | verify |
| E2E web / mobile | Jornadas no Playwright CLI / Maestro | verify |
| Segurança | Checklist do review e auditoria do ecossistema | verify, review |
| Performance web | Trace no Chrome DevTools | verify |

## Mínimos por contexto

| Contexto | Mínimo | Reforço quando |
|---|---|---|
| Lógica de negócio | Unitário | Regra financeira ou legal: casos de borda |
| Feature com back e front | Jornada E2E | Fluxo crítico: mais a falha mais cara |
| Só UI | Teste de componente | Mudança de navegação: jornada |
| Mobile | Componente ou widget | Recurso nativo: jornada no Maestro |
| API interna | Cenários Hurl com negativos | Usada por outro time: contrato |
| API pública ou SDK | Contrato e compatibilidade | Quebra de compatibilidade: por versão |
| Banco ou schema | Integração com banco real | Migration: up, down e dados existentes |
| Eventos ou filas | Produtor e consumidor | Ordem, idempotência, retry |
| Serviço externo | Stub WireMock com a falha mais cara | Fluxo com estado: cenário WireMock |
| Jobs ou pipelines de dados | Integração com amostra; qualidade de dados | Relatório regulatório: reconciliação |
| Cache | Unitário de chave e invalidação | Consistência crítica: conferir no Redis |
| Autenticação ou permissões | Permitido e negado | Novo papel: matriz papel × ação |
| Pagamento | Jornada E2E e unitários dos cálculos | Estorno ou conciliação: jornada da falha |
| Dados pessoais (LGPD) | Mascaramento, retenção e acesso | Exportação: jornada com checagem do conteúdo |
| Feature flag | Ligada e desligada | Rollout gradual: jornada nos dois estados |
| Funcionalidade com LLM | Evals com casos fixos | Saída ao usuário: evals de segurança e formato |
| Correção de bug | Regressão que reproduz a falha | No nível em que o bug aparece |
| Refatoração ou legado | Suíte existente; caracterização onde faltar | Só na área tocada |
| Dependência atualizada | Suíte, smoke e auditoria | Versão major: pontos de uso |
| Infraestrutura ou config | Validação da IaC e smoke | Rede ou permissão: conectividade |
| Só texto ou documentação | Nenhum | Texto em fluxo crítico: rodar a jornada existente |

## Reuso e orçamento por tamanho

| Tamanho | Integração | E2E |
|---|---|---|
| quick | Só endpoints alterados: caminho feliz e 1 negativo | Jornada existente mais próxima; sem jornada em fluxo crítico, uma mínima; em fluxo não crítico, waiver com roteiro manual |
| small | Estender existentes; até 1 cenário novo | Até 1 jornada nova |
| medium | Por fronteira tocada, com os negativos do plan | Até 2 por jornada |
| large | Por fronteira, contrato, cenários com estado | Por jornada; não funcionais se houver risco |
| complex | Definido no plan | Cada extra justificado no gate |

## Fluxos críticos

<preenchido pelo plumb-init>

## Cristalização

critical | off — <preenchido pelo plumb-init>
