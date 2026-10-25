# A spec — git/worktree-native

A spec **não mora no cérebro**. É o arquivo `.plumb/work/<id>.md`, **commitado na branch** da
mudança e **removido/squashed antes do merge** (não polui a main; viaja via push para handoff
cross-máquina; revisável no PR). É também o **estado** da mudança: o acompanhamento vive nela.

`<id>` = o do ticket, senão um slug de 2–5 palavras (`corrige-expiracao-pix`).

## Template

```markdown
# <id> — <título>
Score: <n> (<sinais>) · Branch: <nome> · Estado: construindo|provando|pronto · Atualizado: AAAA-MM-DD

## Objetivo
<1–3 frases: o problema e o resultado. Se houve escolha de abordagem, a escolhida em 1 linha.>

## Combinado (do grill)
- <decisão do usuário> — <porquê>

## Fora de escopo
- <o que alguém suporia incluído, mas não está>

## Resultados esperados        <!-- marca [x] quando provado -->
1. [ ] <comportamento, em linguagem de produto>
       observa-se: <o comando/chamada/tela que demonstra>   <!-- EARS no crítico: WHEN … THE SYSTEM SHALL … -->
2. [ ] <...>

## Fases / waves               <!-- marca [x] quando concluída -->
- [ ] 1. <nome> · <arquivos> · dep: — · sai quando: <critério verificável>
- [ ] 2. <nome> · <arquivos> · dep: 1 · sai quando: <...>

## Evidências                  <!-- cada agente que trabalha registra a sua -->
- code (fase 1) — <o que fez> · <evidência: commit/teste>
- qa — resultado N ✓ <evidência executada>
- review — <veredito> · <achados>

## Notas / handoff
<o que falta, travamentos, problemas fora do escopo — o que uma sessão nova lê para continuar>
```

## Regras

- **Cabeçalho = acompanhamento:** `Estado` e `Atualizado` mudam a cada passo. "Continua o X" lê a
  spec e retoma pelas fases desmarcadas e pelas Notas.
- **Resultados esperados** trazem o `observa-se:` (o roteiro do `qa`, que não vê o diff). Sem
  `observa-se` verificável, o resultado está vago. **EARS** (`WHEN <evento> THE SYSTEM SHALL
  <resposta>`) no crítico (auth, pagamento, dados, contrato).
- **Fases/waves:** papel implícito (quem executa), `dep:` (o que destrava o paralelo), `sai quando:`
  verificável. **Ciclo de vida entra como fase** (ex.: "migração" com critério de rollback), guiada
  pelo playbook da skill — não como seção separada.
- **Evidências:** cada passo (code/qa/review) anexa a sua prova. É o que fica no lugar do antigo
  "provar".
- **Sem seção Design nem Ciclo de vida:** a abordagem escolhida vai em 1 linha no Objetivo; o ciclo
  de vida vira fase.

## spec-lint (gate antes do build)

Reprova a spec que tiver:
- resultado esperado sem `observa-se:`;
- fase sem `sai quando:`;
- marcador `[A DEFINIR]` pendente;
- (no crítico) resultado sem EARS onde a área exige.

## Trilha direta

Score 1–2 não cria spec. Corrige, roda os checks, reporta com evidência no chat.
