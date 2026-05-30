# PROJECT PRINCIPLES — Tanque Cheio

> Updated: 2026-05-20
> Priority: P0 — These principles govern every line of code in this project.

---

## Identity

**Tanque Cheio is NOT a generic app.** It is a premium vehicle management application with distinct personality, editorial design sensibility, and a forward-looking technical vision aligned with 2026+ standards.

Every decision — from architecture to pixel placement — must reflect this identity.

---

## Core Principles

### 1. No Generic Code
- Never use boilerplate patterns that could belong to any app
- Every component, utility, and hook should feel purpose-built for Tanque Cheio
- Avoid "tutorial-quality" code — this is production-grade, premium software
- If a solution looks like it came from a StackOverflow copy-paste, rewrite it

### 2. Premium Quality Bar
- Code must be clean, intentional, and self-documenting
- No `// TODO` left without a tracking issue
- No `any` types — use proper type guards, discriminated unions, or runtime validation
- No dead code — if it's not used, it doesn't exist in the codebase
- Error handling is first-class, not an afterthought

### 3. 2026+ Technical Vision
- **React 19+ patterns:** Server Components awareness, use() hook, Actions, progressive enhancement mindset
- **TypeScript 6.0+:** Strict mode, no implicit any, proper type narrowing, branded types where domain-specific
- **PWA-first:** Offline-capable, installable, push notifications, service worker as a citizen, not an afterthought
- **Edge-native:** API runs on Cloudflare Workers — leverage the edge, minimize cold starts, stateless by design
- **Modern CSS:** `dvh`, `safe-area-inset`, container queries, CSS variables as design tokens, no CSS-in-JS bloat
- **Performance as feature:** Core Web Vitals 2026 targets, bundle consciousness, lazy loading by default
- **Security by default:** HMAC signing, biometric auth, encrypted storage, zero-trust API design

### 4. Personality in Design
- The app has an editorial, brutalist-inspired aesthetic — not Material Design, not Tailwind UI, not shadcn clones
- Typography is a first-class citizen (Bodoni Moda, Jost, JetBrains Mono)
- Micro-interactions have purpose — haptics, animations, transitions all serve the experience
- The app speaks Portuguese (pt-BR) natively — not translated, not i18n-wrapped as an afterthought

### 5. Craft Over Convenience
- Prefer writing the right solution over importing a heavy dependency
- Inline SVG over icon libraries when it serves the design
- Custom hooks over library abstractions when the use case is specific
- IndexedDB directly over storage libraries when the API is simple enough
- The bundle size is a metric we care about — every KB counts

### 6. Domain-Driven Naming
- Variables, functions, and files use domain language: `fuelLogs`, `odometer`, `fullTank`, `vehicleId`
- No generic names like `data`, `items`, `handleClick`, `doThing`
- If you can't name it clearly, the abstraction is wrong

### 7. Testability Without Dogma
- Code should be testable by design (pure functions, dependency injection where needed)
- Testing strategy: unit for logic, integration for context/providers, E2E for critical user flows
- No test for the sake of coverage — tests should catch real regressions

---

## Anti-Patterns (Never Do)

| Pattern | Why Not | Alternative |
|---|---|---|
| `as any` casts | Defeats TypeScript | Type guards, runtime validation, proper types |
| Copy-paste from tutorials | Generic, doesn't fit our architecture | Write purpose-built solutions |
| `useEffect` for everything | Anti-pattern in React 19+ | Use Actions, `use()`, or derived state |
| Heavy utility libraries | Bundle bloat | Native APIs, small focused utilities |
| `console.log` in production | Noise, security risk | Proper logging infrastructure or remove |
| Inline styles for layout | Unmaintainable | CSS variables, Tailwind utilities |
| Magic numbers | Unreadable, fragile | Named constants with documentation |
| `eslint-disable` without reason | Hides real problems | Fix the issue or document why the rule doesn't apply |

---

## Quality Gates

Before any code lands:

1. **TypeScript:** Zero errors, zero `any` without explicit justification
2. **ESLint:** Zero errors, warnings either fixed or documented
3. **Build:** `npm run build` succeeds cleanly
4. **Bundle:** No unexpected size increases (monitor with `vite-bundle-visualizer`)
5. **Review:** Does this code feel like it belongs in Tanque Cheio? If not, rewrite.

---

## References

- `AUDITORIA.md` — Complete bug and issue audit
- `PLANO-CORRECAO.md` — Correction plan with checklist
- `PROJETO.md` — Project overview and requirements
- `ROADMAP.md` — Future features and milestones
- `.agent/ARCHITECTURE.md` — System architecture
