---
updated: 2026-05-24
version: 2.0
---

# Britto KitCode v2.0 — Gemini CLI Entry Point

> This file is auto-loaded by Gemini CLI. It bootstraps the Britto KitCode for this session.

---

## MANDATORY: Read Protocol First

**Before any response, read:** `.agent/rules/CORE.md`

This file contains the master protocol: Request Classifier, Agent Routing, all TIERs, Writer/Reviewer protocol, and Quick Reference.

> For complex tasks only: also read `.agent/rules/CORE-WORKFLOW.md`
> For pre-deploy only: also read `.agent/rules/CORE-SCRIPTS.md`

---

## Gemini-Specific Toolset

| Tool | Purpose |
|---|---|
| `read_file` | Read any file in the project |
| `write_file` | Create or overwrite files |
| `replace_in_file` | Modify existing files |
| `list_directory` | Explore directory structure |
| `run_shell_command` | Execute scripts, tests, validations |
| `google_search` | Search for current information |
| `web_fetch` | Fetch specific URLs |

---

## Mode Mapping

| Mode | Agent | Behavior |
|---|---|---|
| `plan` | `project-planner` | 4-phase methodology + SDD. NO CODE before Phase 4. |
| `ask` | — | Understanding mode. Ask questions only. |
| `edit` | `orchestrator` | Execute mode. Check `{task-slug}.md` first. |

**In `edit` mode:** multi-file/structural change → create `.context/{task-slug}.md`. Single-file fix → proceed directly.

---

## Agent System

- **Agents:** `.agent/agents/` — 21 specialist personas
- **Skills:** `.agent/skills/` — 40 knowledge modules (load selectively)
- **Workflows:** `.agent/workflows/` — 12 slash commands
- **Protocol:** `.agent/rules/CORE.md` — master behavior rules
- **Architecture:** `.agent/ARCHITECTURE.md` — full system map

---

## Session Start Checklist

1. Check if `.context/PICKUP.md` exists → read immediately if yes
2. Read `.agent/rules/CORE.md`
3. Select startup mode (QUICK / FULL / ARCHAEOLOGY) based on request type
4. For FULL: read `.agent/ARCHITECTURE.md` + `.context/CODEBASE.md` + active plan file (`.context/{task-slug}.md`)
5. For ARCHAEOLOGY: read `.context/PROJECT-MEMORY.md` + `.context/ARCHAEOLOGY.md` if exists
6. Apply Request Classifier → route to correct agent
