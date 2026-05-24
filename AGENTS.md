---
updated: 2026-05-24
version: 2.0
---

# Britto KitCode v2.0 — Agents Standard

> Lido automaticamente por qualquer ferramenta de IA (Claude, Gemini, Cursor, Copilot).
> Para protocolo completo, ler: `.agent/rules/CORE.md`

---

## Stack do Projeto

<!-- Preencher ao iniciar cada projeto -->
- **Linguagem principal:** [ex: TypeScript, Python, PHP]
- **Framework:** [ex: Next.js 15, FastAPI, Laravel]
- **Banco de dados:** [ex: PostgreSQL + Prisma]
- **Ambiente:** [ex: Node 22, Python 3.12]
- **OS do Dev:** Windows 11 (usar PowerShell para comandos)

---

## Comandos Essenciais

```bash
# Instalar dependências
[comando de install]

# Rodar em desenvolvimento
[comando de dev]

# Build de produção
[comando de build]

# Rodar testes
[comando de test]

# Lint / type check
[comando de lint]
```

---

## Restrições Críticas

- **NUNCA modificar** sem consultar: [arquivos críticos do projeto]
- **SEMPRE confirmar** antes de: commits, deploys, mudanças em banco
- **OS:** Windows — usar comandos PowerShell, não bash
- Código e variáveis: **sempre em inglês**
- Comunicação com o usuário: **sempre em português**

---

## Sistema de Agentes

Este projeto usa o Britto KitCode v2.0:

| Componente | Localização | Descrição |
|---|---|---|
| Protocolo master | `.agent/rules/CORE.md` | Regras, roteamento, fases |
| Agentes (21) | `.agent/agents/` | Especialistas por domínio |
| Skills (40) | `.agent/skills/` | Conhecimento modular sob demanda |
| Workflows (12) | `.agent/workflows/` | Comandos `/slash` |
| Arquitetura | `.agent/ARCHITECTURE.md` | Mapa completo do sistema |

---

## Memória do Projeto

- `.context/PROJECT-MEMORY.md` — armadilhas, decisões, aprendizados (ler ao iniciar)
- `.context/PICKUP.md` — onde a última sessão parou (ler PRIMEIRO se existir)
- `.context/ARCHAEOLOGY.md` — mapa do código legado (ler antes de modificar legado)

---

## Workflow Padrão para Tasks

```
QUESTION → responder diretamente
SIMPLE FIX → verificar .context/CODEBASE.md → implementar → testar
FEATURE → /plan → spec → plan file → implementar → /review
LEGACY → /archaeo → entender → plan → implementar → /review
```
