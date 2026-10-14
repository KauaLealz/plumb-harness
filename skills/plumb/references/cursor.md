# Fora do Claude Code (Cursor e afins)

O Plumb não assume o Claude Code. Cada recurso que ele usa tem aqui o
equivalente — e um recurso ausente **nunca** cancela a etapa: ele troca de forma.
Se você está no Claude Code, não precisa deste arquivo.

| O Plumb usa | No Cursor | O que **não** muda |
|---|---|---|
| **Ferramenta de perguntas** (opções clicáveis, recomendação primeiro) | lista numerada no texto, recomendação na opção 1, até 4 perguntas juntas | perguntar continua obrigatório nos cinco momentos de parada |
| **`model` no despacho** (tier por subagente) | o despacho roda no modelo da sessão: recorte menor por despacho e o nível de cuidado dito no `<objetivo>` (`references/communication.md`) | o papel, o contrato de prompt e o formato de saída |
| **`effort` no arquivo do agente** | removido na instalação (o Cursor não lê o campo) | o texto do agente, que já diz o tier sugerido |
| **Despacho em paralelo** | peça os dois na mesma mensagem e trate os retornos juntos | continuam sendo dois contextos limpos e independentes |
| **Lista de tarefas nativa** | a lista de to-dos do Cursor; não havendo, a própria spec é a lista — o `summary` diz a fase | o acompanhamento em linguagem de resultado |
| **Plan mode** | apresente a spec como texto e espere o "sim" | nada se escreve antes da aprovação |
| **Hook a cada mensagem** | o Cursor só tem início de sessão: o lembrete do Plumb vem uma vez, e é você que mantém a rota | carregar a skill uma vez e seguir o fluxo |
| **`disallowedTools` e `readonly` nos agentes** | removidos na instalação (`readonly` vira Ask mode e trava shell e MCP) | a regra está **no texto** de cada agente: explorador, planejador, revisor, testador, batedor e coletor não escrevem, mesmo podendo |
| **`claude mcp add`** | entrada em `.cursor/mcp.json`; login pelo botão em Settings → MCP | nada se instala sem o "sim" do usuário |
| **Skills em `~/.claude/skills`** | `~/.cursor/skills` (com as duas ferramentas, o Cursor lê as do Claude Code e nada é duplicado) | as skills são as mesmas |
| **Transcript da sessão** (para o `/plumb-dream`) | sem a linha do hook, o transcript mais recente da pasta do projeto; não havendo, a conversa em contexto | a varredura e a evidência por turno |
| **Worktree, branch, commit** | igual: é git | — |

Regra geral: **o recurso que falta vira forma, nunca omissão.** Não existe "no
Cursor eu pulo a aprovação da spec", "pulo a revisão independente" ou "pulo o
registro no cérebro". Se nem o equivalente existir, diga ao usuário em uma linha
o que deixou de fazer e por quê.
