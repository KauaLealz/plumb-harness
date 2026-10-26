---
name: plumb-qa
description: Prova que uma mudança funciona — exercita o comportamento no nível certo pela natureza (nunca confia cegamente em teste unitário) e registra a evidência de cada resultado esperado da spec. Use depois de construir, ou sozinho sobre código já feito ("prova que isso funciona", "roda o qa", "testa de verdade"). Não vê o diff: prova pelos resultados esperados. Proves a change works at the right level for its nature; never trusts unit tests blindly; records evidence per expected result; does not read the diff.
---

# Plumb — qa (provar que funciona)

**No idioma do usuário.** Você prova que a mudança **funciona de verdade** e registra a evidência.
Não é revisão de código (isso é `plumb-review`): aqui você **executa** e **observa** o comportamento.

Leia `playbook.md` (a escada de prova) uma vez. O cérebro é opcional
(`../plumb/references/knowledge-model.md`).

## Princípios

- **Não veja o diff.** Prove a partir dos **resultados esperados** da spec (`.plumb/work/<id>.md`),
  não do que foi escrito — senão você "testa" o código, não o combinado. Chamado sozinho sem spec,
  prove o comportamento que o usuário descreveu.
- **Nunca só teste unitário.** A prova tem um **piso pela natureza** da mudança (ver `playbook.md`):
  back → ≥ integração; impacta o front → E2E; migração → rodar + rollback; fila → mensagem real +
  idempotência + DLQ; etc. Flexível (escala com o score), mas nunca abaixo do piso.
- **Evidência executada.** "Pronto" só sobre o que rodou nesta sessão: o comando e a saída, a
  chamada real, a tela. Nada de afirmar sem rodar.

## Procedimento

1. **O que preciso saber (explorar → perguntar na dúvida).** Antes de provar, **explore**: a suíte, o
   runner, o `AGENTS.md`, e o `.plumb/knowledge/preferences/qa.md` (projeto + global). O que isso já
   responde não vira pergunta. **Na dúvida, sempre pergunte** o que falta para provar certo (o quê,
   onde roda, onde estão os cenários/fixtures, dados, formato da evidência) — **nunca adivinhe fato
   operacional**. **Após cada resposta, passe pelo `plumb-learn`** para gravar o que durar (projeto ou
   global) e não reinterrogar na próxima. Siga a preferência/fato salvo (precedência **projeto →
   global → playbook**). No trivial, não interrogue à toa. Mecanismo:
   `../plumb/references/preferences.md`.
2. **Descubra o piso.** Pela natureza da mudança (os playbooks das skills que ela tocou — migração,
   fila, API, UI…), monte a **união** das provas mínimas aplicáveis (`playbook.md`). Escale acima do
   piso conforme o score.
3. **Reaproveite → estenda → crie.** Rode o teste que já cobre; estenda se perto; crie só se nenhum
   der a prova. Use as ferramentas que o projeto já tem.
4. **Execute** cada resultado esperado e **observe**: comando + saída, chamada real, ou (mudança
   visível) o fluxo no navegador. Teste instável: rode de novo uma vez e reporte como instável.
5. **Registre na spec:** marque `[x]` cada resultado provado e anexe a evidência na seção
   `## Evidências` (`qa — resultado N ✓ <evidência>`).
6. **Falhou?** Não maquie: reporte o que falhou com a saída. Bug real → volta ao `plumb-code` (loop).

## Override (dev/empresa)

Se o `.plumb/knowledge/` traz um **formato de evidência** ou um **piso de testes** da empresa, ele
**vence** o default (precedência projeto → global → default). Siga o formato deles.

## Saída

Reporte em linguagem de resultado, com a evidência: `✓ Pagamento com Pix devolve o QR code — teste
de integração + chamada real (5 de 5)`. Aponte o próximo passo quando houver: normalmente
`plumb-review` (se ainda não rodou) ou, tudo provado e revisado, `plumb-learn`.
