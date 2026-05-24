---
priority: P0
updated: 2026-05-24
version: 2.0
---

# CORE-WORKFLOW.md — Fases Detalhadas

> Carregado sob demanda pelo CORE.md para tasks COMPLEX CODE e DESIGN.
> Não carregar para requests QUESTION ou SIMPLE CODE.

---

## MODO ANALÍTICO vs. MODO PLANEJAMENTO

Antes de gerar qualquer arquivo, decidir o modo:

| Modo | Trigger | Ação | Plan File? |
|---|---|---|---|
| **SURVEY** | "analise", "encontre", "explique" | Pesquisa + Relatório | ❌ NÃO |
| **PLANNING** | "construa", "refatore", "crie" | Breakdown de Tasks + Dependências | ✅ SIM |

---

## WORKFLOW DE 4 FASES (Inspirado em BMAD + SDD)

### Visão Geral

| Fase | Nome | Foco | Output | Código? |
|---|---|---|---|---|
| 0 | **SPEC** | Definir o QUÊ | `{slug}-spec.md` | ❌ NÃO |
| 1 | **ANALYSIS** | Pesquisar, explorar | Decisões | ❌ NÃO |
| 2 | **PLANNING** | Criar plano | `{slug}.md` | ❌ NÃO |
| 3 | **SOLUTIONING** | Arquitetura, design | Docs de design | ❌ NÃO |
| 4 | **IMPLEMENTATION** | Código conforme plano | Código funcionando | ✅ SIM |
| X | **VERIFICATION** | Testar e validar | Projeto verificado | ✅ Scripts |

> 🔴 **Fluxo:** SPEC → ANALYSIS → PLANNING → APROVAÇÃO DO USUÁRIO → SOLUTIONING → APROVAÇÃO DO DESIGN → IMPLEMENTATION → VERIFICATION → WRITER/REVIEWER

---

### FASE 0 — SPEC (para features novas)

**Quando usar:** Qualquer nova feature ou mudança de comportamento.
**Quando pular:** Bug fix simples, refatoração interna sem mudança de contrato.

```
Agente: project-planner
Output: {task-slug}-spec.md
Gate: SPEC aprovada pelo usuário antes de criar o plan file
```

**O que a spec contém:**
- Inputs/outputs com tipos e validações
- Precondições e pós-condições
- Invariantes (sempre verdadeiro)
- Casos de borda
- Critérios de aceitação mensuráveis
- O que está FORA do escopo

**Regra SDD:** Quando requisito muda → editar SPEC → regenerar tasks afetadas (não editar código diretamente).

---

### FASE 1 — ANALYSIS

```
Agente: explorer-agent ou agente especialista
Ação: explorar codebase, pesquisar contexto, mapear dependências
Output: decisões documentadas no chat ou em arquivo de notas
```

Quando usar `explorer-agent`:
- Codebase complexo precisa de mapeamento
- Dependências de arquivos não estão claras
- Impacto das mudanças é incerto

---

### FASE 2 — PLANNING

**Naming Convention do Plan File:**

| Request do Usuário | Nome do Arquivo |
|---|---|
| "site de e-commerce com carrinho" | `ecommerce-cart.md` |
| "adicionar dark mode" | `dark-mode.md` |
| "corrigir bug de login" | `login-fix.md` |
| "app mobile de fitness" | `fitness-app.md` |

**Regras de Nomenclatura:**
1. Extrair 2-3 palavras-chave do request
2. Lowercase, separado por hífen (kebab-case)
3. Máximo 30 caracteres
4. Localização: `.context/` do projeto

**🔴 PROIBIDO EM MODO PLAN:** Escrever qualquer arquivo `.ts`, `.js`, `.vue`, `.py` ou código fonte.

**Estrutura Obrigatória do Plan File:**

| Seção | Deve Incluir |
|---|---|
| **Overview** | O quê e por quê |
| **Tipo de Projeto** | WEB/MOBILE/BACKEND/LEGACY (explícito) |
| **Critérios de Sucesso** | Outcomes mensuráveis |
| **Tech Stack** | Tecnologias com justificativa |
| **Estrutura de Arquivos** | Layout de diretórios |
| **Task Breakdown** | Todas as tasks com Agent + Skill + INPUT→OUTPUT→VERIFY |
| **Phase X** | Checklist de verificação final |

**Gate de Saída do Plan:**
```
[SE MODO PLANNING]
[OK] Plan file escrito em .context/{slug}.md
[OK] Leitura de .context/{slug}.md retorna conteúdo
[OK] Todas as seções obrigatórias presentes
→ APENAS ENTÃO pode sair do planejamento.
```

---

### FASE 3 — SOLUTIONING

```
Agente: agente especialista do domínio
Ação: definir arquitetura, padrões, APIs, schema
Output: documentos de design (não código)
Gate: aprovação do usuário antes de implementation
```

---

### FASE 4 — IMPLEMENTATION

```
Prioridade de Execução:
P0: database-architect → security-auditor (se projeto tem DB)
P1: backend-specialist (se projeto tem backend)
P2: frontend-specialist OU mobile-developer (web OU mobile — não ambos)
P3: test-engineer, performance-optimizer, seo-specialist
```

**Regra de Seleção de Agente:**
- App web → `frontend-specialist` (NÃO `mobile-developer`)
- App mobile → `mobile-developer` (NÃO `frontend-specialist`)
- API apenas → `backend-specialist` (sem frontend, sem mobile)

**Formato de Task (campos obrigatórios):**

```
- task_id, name, agent, skills, priority
- dependencies (blockers explícitos — sem "talvez")
- INPUT → OUTPUT → VERIFY
- Rollback (como desfazer se necessário)
```

Tasks sem critério de verificação estão incompletas.

---

### FASE X — VERIFICATION

| Passo | Ação | Comando |
|---|---|---|
| 1 | Checklist | Purple check, Template check, Socratic respeitado? |
| 2 | Scripts | Rodar conforme `CORE-SCRIPTS.md` |
| 3 | Build | `npm run build` (ou equivalente) |
| 4 | Runtime | `npm run dev` + teste manual |
| 5 | Writer/Reviewer | Sessão separada revisando contra spec |
| 6 | Concluir | Marcar todos `[ ]` → `[x]` no plan file |

🔴 **Regra:** NÃO marcar `[x]` sem realmente executar a verificação.

**Marcador de Conclusão (adicionar ao plan file após TODOS os checks passarem):**

```markdown
## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ Sem issues críticos
- Tests: ✅ Todos passando
- Build: ✅ Sucesso
- Spec Review: ✅ Writer/Reviewer realizado
- Date: [data atual]
```

---

## PRINCÍPIOS DE BOAS PRÁTICAS

| # | Princípio | Regra | Por quê |
|---|---|---|---|
| 1 | **Tamanho de Task** | 2-10 min, um outcome claro | Verificação fácil e rollback simples |
| 2 | **Dependências** | Apenas blockers explícitos | Sem falhas ocultas |
| 3 | **Paralelo** | Arquivos/agentes diferentes: OK | Evitar conflitos |
| 4 | **Verify-First** | Definir sucesso antes de codar | Previne "feito mas quebrado" |
| 5 | **Rollback** | Toda task tem caminho de recuperação | Tasks falham — estar preparado |
| 6 | **Contexto** | Explicar POR QUÊ, não só O QUÊ | Melhores decisões do agente |
| 7 | **Spec Primeiro** | Spec aprovada antes do plan | Ancora a intenção permanentemente |
