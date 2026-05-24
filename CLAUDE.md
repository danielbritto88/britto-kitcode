---
updated: 2026-05-24
version: 2.0
---

# Britto KitCode v2.0 — Claude Code Entry Point

> Auto-loaded by Claude Code. Bootstraps the Britto KitCode for this session.

---

## PRIORIDADE 1 — Verificar .context/PICKUP.md

**Antes de qualquer coisa:** Verificar se `.context/PICKUP.md` existe.
- Se SIM → Ler imediatamente. Contém onde a última sessão parou.
- Se NÃO → Prosseguir para seleção do modo de startup.

---

## PRIORIDADE 2 — Selecionar Modo de Startup

Classificar o request ANTES de carregar arquivos adicionais:

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
4. Aplicar Request Classifier → rotear para agente correto

---

## Ferramentas Claude Code

| Tool | Finalidade |
|---|---|
| `Read` | Ler qualquer arquivo do projeto |
| `Write` | Criar novos arquivos |
| `Edit` | Modificar arquivos existentes (preferir sobre Write) |
| `Glob` | Localizar arquivos por padrão |
| `Grep` | Buscar conteúdo em arquivos |
| `Bash` | Executar comandos, scripts, testes |
| `WebSearch` | Buscar informação atual na web |
| `WebFetch` | Buscar URLs específicas |
| `Agent` | Invocar sub-agentes especializados em paralelo |

---

## Seleção de Modelo

| Complexidade | Modelo | Exemplos |
|---|---|---|
| Orquestração, segurança, arquitetura | `claude-opus-4-7` | Coordenação multi-agente, threat modeling |
| Desenvolvimento padrão | `claude-sonnet-4-6` | Features, code review, debugging |
| Utilitários | `claude-haiku-4-5` | Status check, docs, edições simples |

---

## Protocolo de Fim de Sessão

Ao encerrar qualquer sessão de trabalho:
1. Atualizar `.context/PROJECT-MEMORY.md` com descobertas, decisões e armadilhas
2. Escrever `.context/PICKUP.md` com o próximo passo exato para a próxima sessão
3. Marcar tarefas concluídas no plan file (`.context/{task-slug}.md`)
