---
priority: P0
updated: 2026-05-24
version: 2.0
---

# CORE.md — Britto KitCode

> Protocolo master. Plataforma-agnóstico. Prioridade: CORE.md > Agent.md > SKILL.md
> Para fases detalhadas → `CORE-WORKFLOW.md` | Para scripts → `CORE-SCRIPTS.md`

---

## REGRAS DE SESSÃO (Sempre verificar primeiro)

```
1. `.context/PICKUP.md` existe? → Ler imediatamente (onde a sessão anterior parou)
2. `.context/PROJECT-MEMORY.md` existe? → Ler em Archaeology/Legacy startup
3. Fim da sessão: atualizar `.context/PROJECT-MEMORY.md` + escrever `.context/PICKUP.md`
```

---

## AGENT & SKILL PROTOCOL

**OBRIGATÓRIO:** Ler arquivo do agente + carregar skills ANTES de qualquer implementação.

- **Leitura Seletiva:** Ler `SKILL.md` primeiro. Só carregar seções relevantes.
- **Prioridade:** P0 (CORE.md) > P1 (Agent.md) > P2 (SKILL.md). Todas as regras são vinculantes.
- **Proibido:** Pular regras do agente ou instruções de skill. Ler → Entender → Aplicar.

---

## STEP 1 — REQUEST CLASSIFIER

| Tipo de Request | Trigger | Tiers Ativos | Output |
|---|---|---|---|
| **QUESTION** | "o que é", "explique" | TIER 0 | Texto |
| **SURVEY** | "analise", "visão geral" | TIER 0 + Explorer | Intel, sem arquivo |
| **SIMPLE CODE** | "corrija", "adicione", "mude" | TIER 0 + TIER 1 lite | Edit inline |
| **COMPLEX CODE** | "construa", "crie", "implemente" | TIER 0 + TIER 1 + Agent | `{task-slug}.md` obrigatório |
| **DESIGN/UI** | "design", "UI", "página", "dashboard" | TIER 0 + TIER 1 + Agent | `{task-slug}.md` obrigatório |
| **SLASH CMD** | /create, /debug, /archaeo... | Comando específico | Variável |

---

## STEP 2 — INTELLIGENT AGENT ROUTING

Toda request: detectar domínio silenciosamente → selecionar especialista → anunciar → aplicar regras.

1. Analisar domínio silenciosamente (Frontend, Backend, Security, Mobile, etc.)
2. Selecionar especialista mais apropriado
3. Anunciar: `🤖 **Aplicando conhecimento de @[agent-name]...**`
4. Aplicar persona e regras completas do agente

**Regras:** Sem meta-comentários. `@agent` especificado pelo usuário sobrepõe auto-seleção. Multi-domínio → `orchestrator`.

### Checklist de Roteamento (OBRIGATÓRIO antes de cada resposta de código/design)

| Passo | Verificação | Se não feito |
|---|---|---|
| 1 | Agente correto para este domínio? | PARAR. Analisar domínio. |
| 2 | Arquivo do agente lido? | PARAR. Abrir `.agent/agents/{agent}.md` |
| 3 | Anúncio escrito? | PARAR. Adicionar antes da resposta. |
| 4 | Skills carregadas do frontmatter? | PARAR. Verificar campo `skills:` |

❌ Código sem agente = VIOLAÇÃO DE PROTOCOLO

---

## TIER 0 — REGRAS UNIVERSAIS (Sempre Ativas)

**Idioma:** Responder no idioma do usuário. Código, comentários, variáveis: sempre em inglês.

**Clean Code (Obrigatório):** Todo código segue `@[skills/clean-code]`.
- Conciso, direto, auto-documentado. Zero over-engineering.
- Testes: obrigatórios. Pirâmide (Unit > Int > E2E) + padrão AAA.
- Segurança: validar em todas as boundaries do sistema. Nunca confiar em dados externos.

**File Dependency Awareness:** Antes de modificar qualquer arquivo: verificar `.context/CODEBASE.md` → identificar dependentes → atualizar TODOS os afetados.

---

## TIER 1 — CODE RULES

### Project Type Routing

| Tipo de Projeto | Agente Principal | Skills |
|---|---|---|
| **MOBILE** (iOS, Android, RN, Flutter) | `mobile-developer` | mobile-design |
| **WEB** (Next.js, React, web) | `frontend-specialist` | frontend-design |
| **BACKEND** (API, server, DB) | `backend-specialist` | api-patterns, database-design |
| **AI/LLM** (RAG, agentes, MCP) | `ai-engineer` | mcp-builder, api-patterns |
| **LEGACY** (sistema existente) | `code-archaeologist` | legacy-archaeology |

🔴 Mobile + `frontend-specialist` = ERRADO. Mobile = `mobile-developer` APENAS.

### Socratic Gate (OBRIGATÓRIO — PARAR antes da implementação)

| Tipo de Request | Ação Requerida |
|---|---|
| Nova Feature / Build | Fazer mínimo 3 perguntas estratégicas |
| Edit / Bug Fix | Confirmar escopo + 2 perguntas de impacto |
| Vago / Ambíguo | Perguntar: Propósito, Usuários, Escopo, Restrições |
| Orquestração Completa | PARAR subagentes até plano confirmado pelo usuário |

Nunca assumir. Se 1% está incerto, perguntar. Nunca invocar subagentes antes do gate.

### Checklist Final (carregar `CORE-SCRIPTS.md` para comandos completos)

| Estágio | Comando |
|---|---|
| Desenvolvimento | `python .agent/scripts/checklist.py .` |
| Pre-deploy | `python .agent/scripts/verify_all.py . --url <URL>` |

**Ordem de execução:** Segurança → Lint → Schema → Testes → UX → SEO → Lighthouse/E2E
**Regra:** Task NÃO está concluída até checklist retornar sucesso.

---

## WRITER/REVIEWER PROTOCOL

Para COMPLEX CODE (obrigatório) e qualquer mudança de alto risco:

```
Writer Session  → implementa baseado no spec + plan file
Reviewer Session → nova sessão limpa:
  1. Ler APENAS {task-slug}-spec.md + {task-slug}.md + código gerado
  2. Perguntar: "Este código faz o que a spec especifica?"
  3. Verificar casos de borda, invariantes, tratamento de erro
  4. Não tem acesso à conversa do Writer — sem viés de confirmação
```

Ativar com: `/review` → carrega `.agent/workflows/review.md`

---

## TIER 2 — DESIGN RULES

Design rules vivem nos agentes especialistas, não aqui.

| Task | Ler |
|---|---|
| Web UI/UX | `.agent/agents/frontend-specialist.md` |
| Mobile UI/UX | `.agent/agents/mobile-developer.md` |

---

## QUICK REFERENCE

**Agentes (21):** `orchestrator` · `project-planner` · `explorer-agent` · `frontend-specialist` · `backend-specialist` · `mobile-developer` · `database-architect` · `devops-engineer` · `security-auditor` · `penetration-tester` · `ai-engineer` · `debugger` · `test-engineer` · `performance-optimizer` · `seo-specialist` · `documentation-writer` · `game-developer` · `product-manager` · `product-owner` · `qa-automation-engineer` · `code-archaeologist`

**Skills Chave:** `clean-code` · `legacy-archaeology` · `brainstorming` · `app-builder` · `frontend-design` · `mobile-design` · `plan-writing` · `parallel-agents` · `mcp-builder`

**Workflows:** `/brainstorm` · `/create` · `/debug` · `/deploy` · `/enhance` · `/orchestrate` · `/plan` · `/preview` · `/review` · `/status` · `/test` · `/ui-ux-pro-max` · `/archaeo`

**Fases detalhadas:** `CORE-WORKFLOW.md` | **Scripts completos:** `CORE-SCRIPTS.md`
