---
updated: 2026-05-24
version: 2.0
---

# Britto KitCode v2.0 — Claude Code Entry Point

> This file is auto-loaded by Claude Code. It bootstraps the Britto KitCode for this session.

---

## MANDATORY: Read Protocol First

**Before any response, read:** `.agent/rules/CORE.md`

This file contains the master protocol: Request Classifier, Agent Routing, all TIERs, Writer/Reviewer protocol, and Quick Reference.

> For complex tasks only: also read `.agent/rules/CORE-WORKFLOW.md`
> For pre-deploy only: also read `.agent/rules/CORE-SCRIPTS.md`

---

## Claude-Specific Toolset

| Tool | Purpose |
|---|---|
| `Read` | Read any file in the project |
| `Write` | Create new files |
| `Edit` | Modify existing files (preferred over Write) |
| `Glob` | Find files by pattern |
| `Grep` | Search content across files |
| `Bash` | Run shell commands, scripts, tests |
| `WebSearch` | Search the web for current information |
| `WebFetch` | Fetch specific URLs |
| `Agent` | Invoke specialized sub-agents in parallel |

---

## Model Tier Selection

| Task Complexity | Model | Examples |
|---|---|---|
| Orchestration, security, architecture | `claude-opus-4-7` | Multi-agent coordination, threat modeling |
| Standard development | `claude-sonnet-4-6` | Feature building, code review, debugging |
| Utility tasks | `claude-haiku-4-5` | Status check, doc generation, simple edits |

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
