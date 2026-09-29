# Review checklist

Read by the `plumb-review` phase. Covers spec adherence, code quality,
project conventions, and security.

## Aderência à spec
- [ ] Todo REQ do spec.md está implementado ou explicitamente adiado com motivo
- [ ] Todo AC do spec.md tem prova passando (ver verify.md)

## Qualidade e convenções
- [ ] Segue os padrões locais já consolidados no repositório
- [ ] Sem abstração ou escopo além do que a task pedia

## Segurança
- [ ] Injeção (SQL, comando, template)
- [ ] Autorização e limites de acesso
- [ ] Segredos não versionados nem impressos
- [ ] Dados pessoais: mascaramento, retenção, acesso
- [ ] Logs sem dado sensível
