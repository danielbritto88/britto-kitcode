---
task: [task-slug]
spec: [task-slug]-spec.md
agent: [agente responsável]
status: planning | in-progress | review | done
created: [data]
updated: [data]
---

# PLAN: [Descrição da Task]

> Este arquivo descreve COMO implementar. A spec (`{slug}-spec.md`) descreve O QUE.
> Gerado pelo `project-planner` a partir da spec aprovada.

---

## Overview

**O quê:** [resumo do que será feito]
**Por quê:** [motivação / problema que resolve]
**Critério de sucesso:** [como saber que está feito e correto]

---

## Tipo de Projeto

`WEB` | `MOBILE` | `BACKEND` | `LEGACY` | `AI/LLM`

---

## Tech Stack

| Componente | Tecnologia | Versão |
|---|---|---|
| | | |

---

## Estrutura de Arquivos

```
[arquivos a criar ou modificar]
```

---

## Task Breakdown

### Task 1 — [Nome]

- **Agente:** `[nome-do-agente]`
- **Skills:** `[skill-1]`, `[skill-2]`
- **Prioridade:** P0 | P1 | P2
- **Depende de:** nenhuma | Task X
- **INPUT:** [o que existe antes desta task]
- **OUTPUT:** [o que deve existir após]
- **VERIFY:** [como verificar que está correto]
- **Rollback:** [como desfazer se necessário]
- [ ] Concluído

---

### Task 2 — [Nome]

- **Agente:** `[nome-do-agente]`
- **Skills:** `[skill-1]`
- **Prioridade:** P1
- **Depende de:** Task 1
- **INPUT:** [estado após Task 1]
- **OUTPUT:** [resultado esperado]
- **VERIFY:** [verificação]
- **Rollback:** [rollback]
- [ ] Concluído

---

## Phase X — Verificação Final

### Checklist de Qualidade

- [ ] Lint e type check: `npm run lint && npx tsc --noEmit`
- [ ] Segurança: `python .agent/scripts/checklist.py .`
- [ ] Testes: todos passando
- [ ] Build: sem erros ou warnings
- [ ] Review: sessão Writer/Reviewer realizada
- [ ] Spec: todos os critérios de aceitação marcados

### Verificação contra a Spec

- [ ] Todos os casos de borda cobertos
- [ ] Invariantes validados
- [ ] Outputs corretos para todos os inputs documentados

### Marcador de Conclusão

```
## ✅ PHASE X COMPLETE
- Lint: ✅
- Security: ✅
- Tests: ✅
- Build: ✅
- Spec Review: ✅
- Date: [data]
```
