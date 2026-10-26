---
name: plumb-document
description: Gera ou atualiza documentação do comportamento ATUAL para humanos (README, docs/, guia de uso, comentários de alto nível) a partir do que o código de fato faz — explora o código antes, não inventa. Use quando o usuário pede "documenta X", "atualiza o README", "escreve um guia de…". A doc vai para o repositório e descreve só o que o sistema faz hoje. Writes or updates human-facing docs of the CURRENT behavior from what the code actually does; explores first, invents nothing; lives in the repo.
---

# Plumb — document (documentar o comportamento atual)

**No idioma do usuário** (a doc em si, no idioma que o projeto já usa). Você descreve o que o
sistema **faz hoje** para **pessoas** — não o porquê, não a intenção, não o que ainda vai mudar.

Leia `playbook.md` (como documentar bem) uma vez. O cérebro é opcional
(`../plumb/references/knowledge-model.md`).

## Princípios

- **Comportamento observável, não intenção.** Documente o que o código **de fato faz** (entrada,
  saída, efeito, erro), não o que deveria fazer. Explore o código antes; não documente o que não
  confirmou. Sem roadmap, sem histórico, sem "em breve".
- **Fronteira doc ↔ cérebro.** A doc descreve **o quê/como usar** para humanos e vai para o
  **repositório** (README, `docs/`). O **porquê**, as convenções e as decisões duráveis são o
  cérebro do agente (`.plumb/knowledge/`) — **nunca** se misturam na doc. Se documentando você
  descobrir uma decisão/porquê que vale guardar, isso vai pro cérebro via **`plumb-learn`**, não pra
  doc.
- **Não invente.** Sem exemplo que você não rodou, sem flag que você não viu, sem endpoint que não
  existe. Afirmação sem respaldo no código não entra.

## Procedimento

1. **O que preciso saber (explorar → perguntar na dúvida).** Antes de escrever, explore: leia
   `.plumb/knowledge/preferences/document.md` (projeto + global), o **template de doc da empresa** se
   houver, e as **docs existentes** (para casar tom e estrutura). O que isso já responde **não vira
   pergunta**. Na dúvida — formato/estilo, onde a doc mora, público-alvo —, **sempre pergunte** pela
   ferramenta de perguntas (recomendação primeiro); não adivinhe. **Após cada resposta, passe pelo
   `plumb-learn`** para gravar o durável e não reinterrogar na próxima vez. Siga a preferência salva —
   precedência **projeto → global → playbook (default)**. No **trivial**, não interrogue à toa: use o
   que explorou e o default. Ver `../plumb/references/preferences.md` (dimensões em `playbook.md`).
2. **Consulte o cérebro** (`.plumb/knowledge/`, projeto + global) pela área: glossário, termos,
   mapa do código e — importante — um **template/estilo de doc da empresa**, se houver.
3. **Explore o código** da área (subagentes de leitura em paralelo em área grande; devolve
   `arquivo:linha`). Documente o comportamento **real** a partir do que leu/rodou.
4. **Escreva/atualize** a doc no repo, no estilo e na estrutura certos (ver `playbook.md`:
   README, guia de uso, referência). Atualizar: case com o que já existe; corrija o defasado.
5. **Prove.** Se há como (link checker, `markdownlint`, o build da doc, rodar um exemplo que você
   escreveu), rode e reporte; senão, releia e confira que **cada afirmação bate com o código**.

## Override (dev/empresa)

Se o `.plumb/knowledge/` traz um **template ou estilo de doc** da empresa, ele **vence** o default
deste playbook (precedência projeto → global → default do harness). Siga a estrutura deles.

## Saída

Diga o que ficou documentado e **onde** (caminho no repo). A doc fica no **repositório**; nada sai
da máquina (push, PR) sem o "sim" do usuário. Decisão ou porquê durável que apareceu no caminho →
**`plumb-learn`** (não entra na doc).
