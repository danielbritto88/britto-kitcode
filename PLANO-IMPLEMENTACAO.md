# Britto KitCode v2.0 — Plano de Implementação

> Refinamento baseado no estado da arte de mai/2026. Pasta de referência original: `.agent/`
> Última sessão: 2026-05-24

---

## Como usar este arquivo

- `[ ]` = não feito
- `[x]` = concluído
- `[~]` = em progresso / parcialmente feito
- Marcar aqui ao final de cada sessão antes de fechar

---

## ETAPA 0 — Estrutura de Pastas (esqueleto completo)

- [x] Criar todas as pastas da nova estrutura
- [x] Confirmar que todas as pastas estão corretas

---

## ETAPA 1 — Arquivos Raiz do Projeto (templates reutilizáveis por projeto)

Estes ficam na raiz de cada projeto. A nova pasta contém os **templates**.

- [x] `CLAUDE.md` — entry point Claude Code (startup condicional, referência ao PICKUP.md)
- [x] `GEMINI.md` — entry point Gemini CLI (idem + referência ao AGENTS.md)
- [x] `AGENTS.md` — padrão cross-tool (Claude, Gemini, Cursor, Copilot)
- [x] `PROJECT-MEMORY.md` — template de memória persistente entre sessões
- [x] `PICKUP.md` — template de handoff de sessão (criado sob demanda pela IA)
- [x] `SPEC-TEMPLATE.md` — template SDD spec (`{task-slug}-spec.md`)
- [x] `PLAN-TEMPLATE.md` — template plan file melhorado (`{task-slug}.md`)
- [x] `ARCHAEOLOGY-TEMPLATE.md` — template para mapeamento de código legado

---

## ETAPA 2 — .claude/ (recursos nativos do Claude Code)

- [x] `.claude/rules/sql.md` — regras automáticas ao editar `*.sql`, `*.prisma`
- [x] `.claude/rules/test.md` — regras automáticas ao editar `*.test.*`, `*.spec.*`
- [x] `.claude/rules/css.md` — regras automáticas ao editar `*.css`, `*.scss`, `*.tailwind`
- [x] `.claude/rules/api.md` — regras automáticas ao editar `route.ts`, `controller.*`, `*.api.*`
- [x] `.claude/rules/legacy.md` — regras automáticas ao editar arquivos em `/legacy`, `/old`, `/v1`

---

## ETAPA 3 — .agent/rules/ (protocolo master)

- [x] `.agent/rules/CORE.md` — protocolo compactado (~80 linhas: essencial + Writer/Reviewer + PICKUP rule)
- [x] `.agent/rules/CORE-WORKFLOW.md` — detalhe das 4 fases (extraído do CORE.md original, carregado sob demanda)
- [x] `.agent/rules/CORE-SCRIPTS.md` — tabela de scripts de verificação (carregado só em pre-deploy)
- [x] `.agent/rules/GEMINI.md` — redirect para CORE.md (copiar original sem mudança)

---

## ETAPA 4 — .agent/ (arquivos raiz do sistema)

- [x] `.agent/CLAUDE.md` — entry point Claude Code dentro do .agent/ (startup condicional)
- [x] `.agent/GEMINI.md` — entry point Gemini CLI dentro do .agent/
- [x] `.agent/ARCHITECTURE.md` — mapa do sistema atualizado (incluindo novidades do v2.0)

---

## ETAPA 5 — .agent/agents/ (21 agentes — copiar + modificar os que precisam)

Copiar todos do original. Modificar apenas os marcados com `*`:

- [x] `orchestrator.md`
- [x] `project-planner.md` * — Phase 0 SPEC (SDD) adicionada
- [x] `explorer-agent.md`
- [x] `frontend-specialist.md` — copiado sem mudanças (excepcional)
- [x] `backend-specialist.md`
- [x] `mobile-developer.md`
- [x] `database-architect.md`
- [x] `devops-engineer.md`
- [x] `security-auditor.md`
- [x] `penetration-tester.md`
- [x] `ai-engineer.md`
- [x] `debugger.md`
- [x] `test-engineer.md`
- [x] `performance-optimizer.md`
- [x] `seo-specialist.md`
- [x] `documentation-writer.md`
- [x] `game-developer.md`
- [x] `product-manager.md`
- [x] `product-owner.md`
- [x] `qa-automation-engineer.md`
- [x] `code-archaeologist.md` * — workflow /archaeo e ARCHAEOLOGY.md integrados

---

## ETAPA 6 — .agent/skills/ (39 skills existentes + 1 novo)

Copiar todos do original. Criar apenas o marcado com `NEW`:

### Skills que copiar (sem mudança):
- [x] `api-patterns/`
- [x] `app-builder/`
- [x] `architecture/`
- [x] `bash-linux/`
- [x] `brainstorming/`
- [x] `clean-code/`
- [x] `code-review-checklist/`
- [x] `database-design/`
- [x] `deployment-procedures/`
- [x] `frontend-design/`
- [x] `game-development/`
- [x] `geo-fundamentals/`
- [x] `i18n-localization/`
- [x] `lint-and-validate/`
- [x] `mobile-design/`
- [x] `mcp-builder/`
- [x] `nextjs-react-expert/`
- [x] `nodejs-best-practices/`
- [x] `parallel-agents/`
- [x] `performance-profiling/`
- [x] `powershell-windows/`
- [x] `python-patterns/`
- [x] `red-team-tactics/`
- [x] `rust-pro/`
- [x] `seo-fundamentals/`
- [x] `server-management/`
- [x] `systematic-debugging/`
- [x] `tailwind-patterns/`
- [x] `tdd-workflow/`
- [x] `testing-patterns/`
- [x] `vulnerability-scanner/`
- [x] `web-design-guidelines/`
- [x] `webapp-testing/`
- [x] `behavioral-modes/`
- [x] `documentation-templates/`
- [x] `intelligent-routing/`
- [x] `plan-writing/`
- [x] `doc.md`

### Skill novo:
- [x] `legacy-archaeology/SKILL.md` — NEW: skill para mapeamento sistemático de código legado

---

## ETAPA 7 — .agent/workflows/ (12 workflows — pasta nova, todos novos)

A pasta não existia. Criar todos do zero:

- [x] `brainstorm.md` — /brainstorm: descoberta socrática
- [x] `create.md` — /create: scaffold de nova aplicação
- [x] `debug.md` — /debug: investigação de causa raiz
- [x] `deploy.md` — /deploy: pipeline de deployment completo
- [x] `enhance.md` — /enhance: melhoria de qualidade de código existente
- [x] `orchestrate.md` — /orchestrate: coordenação multi-agente
- [x] `plan.md` — /plan: geração de plan file + spec SDD
- [x] `preview.md` — /preview: visualizar mudanças pendentes
- [x] `review.md` — /review: NEW — Writer/Reviewer pattern (sessão de revisão)
- [x] `status.md` — /status: health check do projeto
- [x] `test.md` — /test: rodar suítes de teste
- [x] `ui-ux-pro-max.md` — /ui-ux-pro-max: sistema de design
- [x] `archaeo.md` — /archaeo: NEW — mapeamento de código legado

---

## ETAPA 8 — .agent/scripts/ (copiar todos do original)

- [x] `auto_preview.py`
- [x] `checklist.py`
- [x] `session_manager.py`
- [x] `verify_all.py`

---

## ETAPA 9 — .agent/.shared/ (copiar do original)

- [x] `.shared/ui-ux-pro-max/` — copiada toda a estrutura (data/, scripts/)
- [x] Converter CSVs para markdown indexado (24 arquivos — csv_to_md.py)

---

## ETAPA 10 — Global (fora do projeto)

- [x] `~/.claude/CLAUDE.md` — preferências globais do usuário (aplica a TODOS os projetos)

---

## Resumo de Progresso

| Etapa | Descrição | Status |
|---|---|---|
| 0 | Estrutura de pastas | ✅ Concluído |
| 1 | Arquivos raiz (templates) | ✅ Concluído |
| 2 | .claude/rules/ | ✅ Concluído |
| 3 | .agent/rules/ | ✅ Concluído |
| 4 | .agent/ raiz | ✅ Concluído |
| 5 | .agent/agents/ | ✅ Concluído |
| 6 | .agent/skills/ | ✅ Concluído |
| 7 | .agent/workflows/ | ✅ Concluído |
| 8 | .agent/scripts/ | ✅ Concluído |
| 9 | .agent/.shared/ | ✅ Concluído (CSVs → MD) |
| 10 | Global ~/.claude/ | ✅ Concluído |

---

## Notas de Sessão

### Sessão 2026-05-24
- Análise comparativa completa do sistema original vs. estado da arte (Britto KitCode v2.0)
- Plano de refinamento aprovado
- Estrutura de pastas criada
- Próximo: Etapa 1 — Arquivos raiz
