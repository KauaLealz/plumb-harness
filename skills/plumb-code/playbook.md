# Playbook do code — como construir bem

A expertise do `plumb-code`: como implementar uma fase com qualidade, e as **fatias de
ciclo de vida** por área (como construir + a pegadinha). A **prova mínima** de cada
área é o `plumb-qa` que roda (ver o playbook dele); aqui o foco é o **COMO construir**.

## O ritmo de uma fase (TDD por padrão)

1. **RED** — escreva o teste que expressa o `observa-se:` do resultado, nas bordas
   (zero, negativo, limite, caminho de erro). Rode e **veja falhar** — teste que nunca
   falhou não prova nada.
2. **GREEN** — o código **mínimo** que faz passar. Nada de generalizar antes da hora.
3. **REFACTOR** — limpe com os testes verdes: nomes, duplicação, extração. Os testes
   são a rede.
4. **Commit atômico** — a fase inteira num commit que compila e passa os checks dela.

Onde o TDD unitário não cabe (UI, infra, migração, deploy, fila), troque o passo RED
pela **prova da natureza** (abaixo): E2E, dry-run, rollback testado, mensagem real.
A fase não fecha sem essa prova.

## Princípios de construção

- **Siga o código que já existe.** Estilo, estrutura, utilitários e padrões do projeto
  antes de inventar. Leia os vizinhos antes de escrever.
- **Mínimo que satisfaz a fase.** Não faça a fase seguinte "de brinde"; não refatore o
  que a fase não pediu (isso é escopo → replaneje).
- **Só os arquivos declarados.** Precisou de outro → pare e replaneje. Não alargue.
- **Erro explícito.** Falhe cedo, com mensagem no idioma do projeto; nada de engolir
  exceção nem retornar nulo silencioso.
- **Nada de segredo no código.** Chave/token por configuração; nunca em commit nem log.
- **Dependência nova = decisão.** Confirme antes de adicionar lib; cheque a doc atual
  (`plumb-find-docs`) em vez de confiar na memória da API.

## Fatias de ciclo de vida (como construir + pegadinha)

| Área | Como construir | Pegadinha |
|---|---|---|
| **Feature / lógica** | Teste primeiro nas bordas; código mínimo; mantenha a função pura onde dá, efeito colateral na beirada. Siga os contratos existentes. | Generalizar cedo demais; "feature list" que vaza para a fase seguinte. |
| **Migração de banco** | Escreva **forward E rollback** no mesmo commit; migração **reversível e idempotente**; mudança de schema separada da de dados. Expand→migrate→contract para não quebrar o código antigo em produção. | Rollback que perde dados; migração longa que trava a tabela; assumir que roda uma vez só. |
| **Filas / async** | Consumidor **idempotente** (chave de deduplicação/efeito só-uma-vez); retry com backoff; **DLQ** para o que falha de vez; produtor e contrato da mensagem versionados. | Efeito duplicado na reentrega; mensagem "envenenada" em loop sem DLQ; ordem assumida que a fila não garante. |
| **Deploy / release** | Defina a **estratégia** (rolling/blue-green/canário) e o **plano de rollback** antes; mudança arriscada atrás de **feature flag**; migração compatível com a versão anterior durante a janela. | Deploy sem caminho de volta; flag que nunca é removida; migração que o rollback do código não acompanha. |
| **Feature flag** | Default seguro (desligado); código funciona nos **dois estados**; registre quem/quando liga; planeje a remoção da flag. | Caminho "ligado" nunca exercitado; flag órfã que vira dívida permanente. |
| **Observabilidade** | Instrumente ao construir: log estruturado no idioma certo, métrica do que importa, trace no fluxo novo; erro com contexto para diagnosticar. | PII/segredo em log; log ruidoso que afoga o sinal; métrica que ninguém olha. |
| **API / contrato** | Aditivo e retrocompatível por padrão; quebra → **versione**; documente o contrato (schema/OpenAPI) junto do código; valide entrada na borda. | Quebrar o consumidor existente sem versionar; campo novo obrigatório sem default; validação só no cliente. |
| **Dados pessoais / segurança** | Minimize o que guarda; mascare na saída e no log; valide e escape toda entrada externa; autorize no servidor (permitido **e** negado). | Confiar na validação do front; PII em log/export; autorização só na UI. |
| **UI** | Componha com os componentes existentes; estados de carregando/vazio/erro; acessível por teclado; prova por abrir a tela / E2E do fluxo. | "Funciona na minha tela": só o caminho feliz, sem estado de erro nem responsivo. |

## Waves (fases em paralelo)

Fases com `dep:` satisfeito e **arquivos disjuntos** rodam juntas (ver
`../plumb/references/parallel.md`): worktrees filhos, cada implementador só no seu,
integração uma por vez na branch da mudança com a verificação do lote após cada merge.
Lotes independentes não deveriam conflitar — conflito em lógica para e vai ao usuário.

## Quando travar

Mesma verificação falha duas vezes, ou o implementador volta `travado`: **não insista
com a mesma hipótese**. Procure no `.plumb/knowledge` pelo sintoma, releia a causa (não o sintoma), e
sem saída leve opções ao usuário. Precisou de arquivo fora do escopo → `escopo`,
replaneje.

## Pegadinhas gerais

- Commit que não compila ou não passa os checks da fase não é commit atômico — conserte
  antes de marcar a fase.
- "Pronto" sem rodar o `sai quando:` nesta sessão é palpite.
- Bug: deixe o teste que reproduziu como **regressão**; corrija a causa, não o sintoma.
- Não teste nem edite código gerado ou de terceiros como se fosse seu.
