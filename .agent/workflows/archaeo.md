---
name: archaeo
trigger: /archaeo
description: Legacy code archaeology workflow — maps an undocumented module, generates a persistent ARCHAEOLOGY.md map, and updates PROJECT-MEMORY.md. Run before any modification of legacy code.
agent: code-archaeologist
---

# /archaeo — Legacy Code Archaeology Workflow

## Purpose

Before modifying legacy code, you must understand it. This workflow systematically maps a module and produces `ARCHAEOLOGY.md` — a persistent document that future sessions can read instead of re-discovering.

## When to Use

- Before modifying any code in `/legacy/`, `/old/`, `/v1/`
- When CORE.md prompts you to run `/archaeo` before modifying
- When `code-archaeologist` is invoked on a module
- When debugging unknown behavior in old code

---

## Invocation

```
/archaeo [module-or-path]
```

Examples:
```
/archaeo src/legacy/payments
/archaeo ./old/auth.js
/archaeo v1/
```

---

## 5-Step Workflow

### Step 1: Locate and Read

```
1. Find all files in the target module/path
2. Read entry points first (index.*, main.*, app.*)
3. Trace dependencies (what does this module import/export?)
4. Check if `.context/ARCHAEOLOGY.md` already exists → if yes, read it first
5. Check `.context/PROJECT-MEMORY.md` for prior discoveries
```

**Commands:**
```bash
# Map the module
find ./legacy/payments -type f | sort

# Find entry points
grep -r "export default\|module.exports" ./legacy/payments --include="*.js"

# Trace imports
grep -r "require\|import" ./legacy/payments --include="*.js" | head -30
```

### Step 2: Map Data Flow

For each significant file/function:
- **Inputs**: Parameters, globals, environment vars read
- **Outputs**: Return values, side effects
- **Side Effects**: DB writes, file I/O, external API calls, events emitted
- **Coupling Points**: What breaks if this changes?

### Step 3: Assess Risk

Classify each file:

| Class | Criteria | Action |
|-------|----------|--------|
| **SAFE** | Isolated, tested, clear purpose | Can modify directly |
| **FRAGILE** | Multiple consumers, no tests | Minimum touch, wrap if possible |
| **DO NOT TOUCH** | Critical path, no tests, high coupling | Strangler Fig only |

### Step 4: Generate ARCHAEOLOGY.md

Write to `.context/ARCHAEOLOGY.md`. Use this format:

```markdown
# ARCHAEOLOGY.md

**Module:** [module name / path]
**Date Mapped:** [date]
**Risk Level:** LOW / MEDIUM / HIGH / CRITICAL

## Entry Points
[file:line → exported function / class]

## Exit Points (Side Effects)
[DB tables written, files touched, APIs called, events emitted]

## Dependency Map
[tree showing internal and external dependencies]

## Known Traps
[surprising behaviors, magic numbers, intentional hacks]

## Safe Modification Approach
[step-by-step instructions for modifying this module safely]

## Do NOT Change
[specific things that must never be modified and why]

## Strangler Fig Points
[where new code can wrap old code without touching it]
```

### Step 5: Update .context/PROJECT-MEMORY.md

Add to the "Mapped Modules" section:
```markdown
## Mapped Modules
- [date] `./legacy/payments/` — .context/ARCHAEOLOGY.md written, Risk: HIGH
  - Trap: processPayment() mutates input (does not return new object)
  - Safe entry point: wrap via new PaymentService class
```

---

## Before You Begin Modifying

After `/archaeo`, the code-archaeologist MUST:

1. **Confirm** risk level with user if HIGH or CRITICAL
2. **Write characterization tests** capturing current behavior
3. **Get tests passing** on current (broken/legacy) code
4. **ONLY THEN** begin modifications
5. **Run tests after every change** — stop immediately if anything breaks

---

## Output Guarantee

When `/archaeo` completes:
- [ ] `.context/ARCHAEOLOGY.md` exists
- [ ] `.context/PROJECT-MEMORY.md` updated with findings
- [ ] Risk level declared and communicated
- [ ] Safe modification path documented
- [ ] User knows what NOT to touch

---

> **Chesterton's Fence:** Don't remove what you don't understand. Map first, modify second.
