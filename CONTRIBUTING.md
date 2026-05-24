# Contributing to Britto KitCode

Thank you for your interest in contributing.

## What this project is

Britto KitCode is a **template system** — a set of Markdown files that structure how AI coding assistants (Claude Code, Gemini CLI, Cursor, Copilot) behave in your projects. There is no executable code to compile or test in the traditional sense.

---

## Ways to contribute

### Bug reports
Open an issue describing:
- Which file contains the problem
- What behavior you expected vs. what happened
- Which AI tool you were using (Claude Code / Gemini CLI / Cursor / Copilot)

### Improvements to existing files
- Agent definitions (`.agent/agents/`)
- Skill modules (`.agent/skills/`)
- Workflow definitions (`.agent/workflows/`)
- Auto-rules (`.claude/rules/`)

Open a PR with a clear description of what changed and why.

### New agents or skills
If you want to add a new specialist agent or skill module:
1. Follow the existing format (check any file in `.agent/agents/` or `.agent/skills/`)
2. Add the agent/skill to `.agent/ARCHITECTURE.md`
3. Reference it in `README.md` if user-facing

---

## Guidelines

- **Language:** Agent/skill content should be in English (the AI reads it). User-facing docs can be bilingual.
- **Token efficiency:** Keep files concise. Every line loaded by the AI costs tokens.
- **No breaking changes without discussion:** CORE.md and the startup protocol are critical paths — changes there affect every session.
- **One thing per PR:** Focused PRs are reviewed faster.

---

## File structure reference

```
.agent/
├── agents/      ← 21 specialist personas
├── skills/      ← 40 knowledge modules (loaded on demand)
├── workflows/   ← 13 slash command definitions
├── rules/       ← CORE.md master protocol
└── templates/   ← Reference templates for .context/ files

.claude/
└── rules/       ← Native Claude Code rules (auto-loaded by file type)
```

---

## Questions

Open a [GitHub Discussion](https://github.com/danielbritto88/britto-kitcode/discussions) for questions that aren't bugs or feature requests.
