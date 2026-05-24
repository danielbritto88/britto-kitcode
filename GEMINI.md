---
updated: 2026-05-24
version: 2.0
---

# Britto KitCode v2.0 — Gemini CLI Entry Point

> Auto-loaded by Gemini CLI. Bootstraps the Britto KitCode for this session.

---

## PRIORIDADE 1 — Verificar .context/PICKUP.md

**Antes de qualquer coisa:** Verificar se `.context/PICKUP.md` existe.
- Se SIM → Ler imediatamente. Contém onde a última sessão parou.
- Se NÃO → Prosseguir para seleção do modo de startup.

---

## PRIORIDADE 2 — Selecionar Modo de Startup

| Tipo de Request | Modo | Ação |
|---|---|---|
| Pergunta / explicação / fix pontual | **QUICK** | Ler só `.agent/rules/CORE.md` → responder |
| Build / create / implement / refactor | **FULL** | Seguir Full Startup abaixo |
| Design / UI / arquitetura | **FULL** | Seguir Full Startup abaixo |
| Código legado / sistema desconhecido | **ARCHAEOLOGY** | Seguir Archaeology Startup abaixo |

---

## QUICK Startup

1. Ler `.agent/rules/CORE.md`
2. Aplicar Request Classifier → rotear para agente correto
3. Responder

---

## FULL Startup

1. Ler `.agent/rules/CORE.md`
2. Ler `.agent/ARCHITECTURE.md`
3. Verificar se `.context/CODEBASE.md` existe → ler
4. Verificar se `.context/{task-slug}.md` existe → ler
5. Verificar se `.context/{task-slug}-spec.md` existe → ler
6. Aplicar Request Classifier → rotear para agente correto

---

## ARCHAEOLOGY Startup

1. Ler `.agent/rules/CORE.md`
2. Ler `.context/PROJECT-MEMORY.md` se existir
3. Verificar se `.context/ARCHAEOLOGY.md` existe para o módulo alvo
   - Se SIM → ler (mapa existente)
   - Se NÃO → ativar `code-archaeologist` → executar `/archaeo` primeiro

---

## Ferramentas Gemini CLI

| Tool | Finalidade |
|---|---|
| `read_file` | Ler qualquer arquivo do projeto |
| `write_file` | Criar ou sobrescrever arquivos |
| `replace_in_file` | Modificar arquivos existentes |
| `list_directory` | Explorar estrutura de diretórios |
| `run_shell_command` | Executar scripts, testes, validações |
| `google_search` | Buscar informação atual |
| `web_fetch` | Buscar URLs específicas |

---

## Mapeamento de Modos

| Modo | Agente | Comportamento |
|---|---|---|
| `plan` | `project-planner` | Metodologia 4 fases. SEM CÓDIGO antes da Fase 4. |
| `ask` | — | Modo entendimento. Apenas perguntas. |
| `edit` | `orchestrator` | Modo execução. Verificar `{task-slug}.md` primeiro. |

**Em modo `edit`:** mudança multi-arquivo/estrutural → criar `.context/{task-slug}.md`. Fix de arquivo único → prosseguir diretamente.

---

## Protocolo de Fim de Sessão

Ao encerrar qualquer sessão de trabalho:
1. Atualizar `.context/PROJECT-MEMORY.md` com descobertas, decisões e armadilhas
2. Escrever `.context/PICKUP.md` com o próximo passo exato para a próxima sessão
3. Marcar tarefas concluídas no plan file (`.context/{task-slug}.md`)
