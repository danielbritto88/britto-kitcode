---
name: legacy-archaeology
description: Systematic methodology for mapping, understanding, and safely modifying undocumented legacy code. Generates ARCHAEOLOGY.md maps that persist across sessions. Use with /archaeo command or code-archaeologist agent.
applies_to: ["*.js", "*.ts", "*.py", "*.java", "*.php", "*.rb"]
priority: P0
---

# Legacy Archaeology Skill

## Overview

This skill provides the systematic methodology used by the `code-archaeologist` agent to map, understand, and safely modify legacy code. The primary output is `ARCHAEOLOGY.md` — a persistent map that survives session resets.

## When This Skill Activates

- `/archaeo` command is invoked
- `code-archaeologist` agent is active
- Any file in `/legacy/`, `/old/`, `/v1/` directories is being modified
- `.claude/rules/legacy.md` triggers (auto-loaded for legacy path patterns)

---

## The Chesterton's Fence Principle

> **Never remove or modify a line of code until you understand why it was put there.**

Before changing ANYTHING in legacy code:
1. Read the surrounding code for context (at least 50 lines up/down)
2. Search for all callers/consumers of this code
3. Check git blame/history if available
4. Ask: "Why would a developer have written this?"

---

## Excavation Methodology

### Phase 1: Locate & Map (Read-Only)

```bash
# Find all files in the target module
find ./legacy/module -type f | sort

# Identify entry points
grep -r "export default\|module.exports\|def main\|public static void main" ./legacy/

# Trace imports/dependencies
grep -r "require\|import\|from" ./legacy/module --include="*.js" --include="*.ts"

# Find all callers of this module
grep -r "require.*legacy\|import.*legacy" . --include="*.js" --include="*.ts" -l
```

### Phase 2: Risk Classification

Classify every significant file before touching it:

| Classification | Criteria | Allowed Changes |
|----------------|----------|-----------------|
| **SAFE** | Isolated, has tests, clear purpose | Full refactor OK |
| **FRAGILE** | Multiple consumers, no tests, unclear | Minimum intervention only |
| **DO NOT TOUCH** | Critical path, no safety net, high coupling | Read-only — wrap instead |

### Phase 3: Generate ARCHAEOLOGY.md

Write the map BEFORE any modification. Use this structure:

```markdown
# ARCHAEOLOGY.md — [Module Name]

**Date Mapped:** [date]
**Mapped by:** [agent/session]
**Risk Level:** [LOW / MEDIUM / HIGH / CRITICAL]

## Entry Points
- `path/to/file.js:42` — exports `functionName`, called by X, Y, Z

## Exit Points (Side Effects)
- Writes to: [database tables, files, external APIs]
- Emits: [events, messages]
- Modifies: [global state, shared objects]

## Dependency Map
```
ModuleA
  └── imports → ModuleB (tight coupling)
  └── imports → ModuleC (loose, easily replaceable)
  └── calls DB directly → users table (bypasses ORM)
```

## Known Traps
- Line 156: magic number `42` = session timeout in minutes (not seconds)
- Line 203: `setTimeout(0)` is intentional — forces microtask queue flush
- `calculateTax()` mutates input object (does not return new object)

## Safe Modification Approach
1. Add characterization tests first (capture current behavior)
2. Only then modify, one function at a time
3. Run tests after each change
4. Never change more than one behavior per commit

## What NOT to Change
- The `legacyAuth()` function — it contains undocumented security behavior
- The sleep() calls in the retry loop — they're load-limiting on a shared resource
```

---

## The Strangler Fig Pattern (Safe Refactor)

For DO NOT TOUCH code, wrap it instead of modifying it:

```typescript
// Old code (do not touch)
// legacyModule.js — 500 lines, no tests

// New wrapper (safe to modify)
// newModule.ts
export function processOrder(input: OrderInput): OrderResult {
  // New validation
  validate(input);
  
  // Call old code unchanged
  const legacyResult = legacyModule.processOrder(input);
  
  // New output transformation
  return transform(legacyResult);
}
```

Gradually migrate consumers to the new wrapper. Old code runs unchanged until all consumers are migrated.

---

## Characterization Testing (BEFORE any change)

Write "Golden Master" tests that capture current behavior:

```typescript
// Characterization test — captures current output, not desired output
describe('legacyCalculateTax (characterization)', () => {
  it('returns current behavior for known inputs', () => {
    // Do not assert what SHOULD happen
    // Assert what DOES happen right now
    expect(legacyCalculateTax(100, 'CA')).toEqual(8.25);
    expect(legacyCalculateTax(0, 'TX')).toEqual(0);
    expect(legacyCalculateTax(-1, 'NY')).toEqual(null); // weird but real
  });
});
```

Tests must pass on the CURRENT code before any refactoring begins.

---

## Anti-Patterns

| ❌ Never Do | ✅ Always Do |
|------------|-------------|
| Modify without reading the full module | Map first, touch second |
| Delete "dead code" without understanding callers | Use grep to find all references |
| Refactor without characterization tests | Tests first, refactor second |
| Big-bang rewrite | Incremental Strangler Fig |
| Assume the code is wrong | Assume there was a reason |

---

## Session Persistence

After any archaeology session, update two files:
1. **`.context/ARCHAEOLOGY.md`** — Update with new discoveries (never delete entries, only add)
2. **`.context/PROJECT-MEMORY.md`** — Add to "Known Traps" and "Mapped Modules" sections

The next session starts by reading these files, not re-discovering from scratch.
