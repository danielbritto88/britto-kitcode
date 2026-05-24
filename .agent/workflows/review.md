---
name: review
trigger: /review
description: Writer/Reviewer protocol — opens an independent review session that reads ONLY the plan file and produced code, with no memory of implementation decisions. Finds issues the writer missed due to confirmation bias.
agent: claude-sonnet-4-6
---

# /review — Independent Code Review Workflow

## Purpose

The developer who wrote code has confirmation bias — they subconsciously justify their own decisions. This workflow opens a "Reviewer Session" with zero context from the Writer Session, finding issues the writer couldn't see.

## When to Use

- Before merging any non-trivial feature
- After completing a complex implementation
- When a task was marked done but feels uncertain
- Any time the Writer wants an independent perspective

---

## The Protocol

### Writer/Reviewer Separation Rule

```
WRITER SESSION:
  - Has full context of the implementation
  - Made design decisions and tradeoffs
  - Has confirmation bias

REVIEWER SESSION (/review):
  - Reads ONLY: plan file + generated code
  - Has NO context from the Writer Session
  - Evaluates: "Does this code match the spec?"
```

---

## Reviewer Inputs (Required)

When invoking `/review`, provide:

```
/review [plan-file-path]
```

Or if no argument, the reviewer will:
1. Look for `.context/PICKUP.md` → find active plan file
2. Look for any `*.md` plan files in `.context/`
3. Ask user which plan to review against

---

## Review Phases

### Phase 1: Spec/Plan Comprehension

Read the plan file ONLY. Do NOT look at code yet.

From the plan, extract:
- What should this feature DO? (inputs, outputs)
- What are the success criteria?
- What are the explicit constraints?
- What was the acceptance criteria?

Build a mental model of what CORRECT code should look like.

### Phase 2: Code Review (Against Spec)

Now read the code. For each component, ask:

| Question | What to Check |
|----------|---------------|
| **Completeness** | Does the code implement ALL spec requirements? |
| **Correctness** | Does it handle all edge cases the spec mentions? |
| **Missing cases** | What did the spec say about error states? Are they handled? |
| **Scope creep** | Did the writer add things NOT in the spec? |
| **Security** | Are there any obvious vulnerabilities? |
| **Test coverage** | Do the tests actually verify the acceptance criteria? |

### Phase 3: Independent Report

Produce this report (do NOT reference the Writer Session's reasoning):

```markdown
## Review Report: [feature-name]

**Plan file reviewed:** [path]
**Code reviewed:** [files]

### ✅ Matches Spec
- [List what is correctly implemented]

### ⚠️ Discrepancies Found
- [List where code diverges from spec]
- [Include line numbers and specific issues]

### ❌ Missing Implementations
- [List spec requirements not implemented in code]

### 🔒 Security Observations
- [Any security concerns not in the spec]

### 📝 Recommendation
[ ] APPROVE — matches spec, ship it
[ ] REVISE — [specific changes required before merge]
[ ] REJECT — fundamental mismatch with spec, needs rework
```

---

## Common Reviewer Findings

The reviewer should specifically check for:

1. **The Happy Path Only Bug** — Code works for the demo but fails for edge cases in the spec
2. **Missing Error States** — Spec said "handle auth failure" but code has no error branch
3. **Wrong Assumptions** — Writer assumed X was always true; spec says it can be false
4. **Scope Drift** — Code does more (or less) than what the spec requested
5. **Test Theatre** — Tests pass but don't actually verify the acceptance criteria
6. **Silent Failures** — Errors swallowed without proper handling

---

## After Review

- If APPROVE: Writer can merge
- If REVISE: Writer fixes specific issues, can re-run `/review` or self-review
- If REJECT: Writer and Reviewer discuss in a new session with both contexts

---

> **Rule:** The Reviewer has no emotional investment in the code. Use that objectivity.
