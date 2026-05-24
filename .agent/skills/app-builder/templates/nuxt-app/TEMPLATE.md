---
name: nuxt-app
description: Nuxt 4 full-stack template. Vue 3 (Vapor), Pinia, Tailwind v4, Prisma.
---

# Nuxt 4 Full-Stack Template (2026 Edition)

Modern full-stack template for Nuxt 4, optimized with Vue Vapor Mode and Tailwind v4.

## Tech Stack

| Component | Technology | Version / Notes |
|-----------|------------|-----------------|
| Framework | Nuxt | v4.0+ (App Directory structure) |
| UI Engine | Vue | v3.6+ (Vapor Mode enabled) |
| Language | TypeScript | v5+ (Strict Mode) |
| State | Pinia | v3+ (Store syntax) |
| Database | PostgreSQL | Prisma ORM |
| Styling | Tailwind CSS | v4.0 (Vite Plugin, Zero-config) |
| UI Lib | Nuxt UI | v3 (Tailwind v4 native) |
| Validation | Zod | Schema validation |

---

## Directory Structure (Nuxt 4 Standard)

Uses `app/` directory to keep the project root clean.

```
project-name/
├── app/                  # Application Source
│   ├── assets/
│   │   └── css/
│   │       └── main.css  # Tailwind v4 imports
│   ├── components/       # Auto-imported components
│   ├── composables/      # Auto-imported logic
│   ├── layouts/
│   ├── pages/            # File-based routing
│   ├── app.vue           # Root component
│   └── router.options.ts
├── server/               # Nitro Server Engine
│   ├── api/              # API Routes (e.g. /api/users)
│   ├── routes/           # Server Routes
│   └── utils/            # Server-only helpers (Prisma)
├── prisma/
│   └── schema.prisma
├── public/
├── nuxt.config.ts        # Main Config
└── package.json
```

---

## Key Concepts (2026)

| Concept | Description |
|---------|-------------|
| **App Directory** | `app/` separates source code from root config files |
| **Vapor Mode** | Opt-in VDOM-less rendering (like SolidJS) — enable per component with `vapor` attribute |
| **Server Functions** | RPC-style calls from client directly to server functions — replaces manual API routes |
| **Tailwind v4** | CSS-first config — theme defined in CSS with `@theme`, no `tailwind.config.js` |
| **Nuxt Islands** | Isolated server-rendered components: `<NuxtIsland name="..." />` |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Prisma connection string (PostgreSQL) |
| NUXT_PUBLIC_APP_URL | Canonical URL |
| NUXT_SESSION_PASSWORD | Session encryption key |

---

## Setup Steps

1. Initialize Project:
   ```bash
   npx nuxi@latest init my-app
   # Select "Nuxt 4 structure" if prompted
   ```

2. Install Core Deps:
   ```bash
   npm install @pinia/nuxt @prisma/client zod
   npm install -D prisma
   ```

3. Setup Tailwind v4:
   Install the Vite plugin (new standard):
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

   Add to `nuxt.config.ts`:
   ```ts
   import tailwindcss from '@tailwindcss/vite'
   export default defineNuxtConfig({
     vite: {
       plugins: [tailwindcss()]
     },
     css: ['~/assets/css/main.css']
   })
   ```

4. Configure CSS:
   In `app/assets/css/main.css`:
   ```css
   @import "tailwindcss";
   @theme {
     --color-primary: oklch(0.6 0.15 150);
   }
   ```

5. Run Development:
   ```bash
   npm run dev
   # Runs with Turbo/Vite
   ```

---

## Best Practices

- **Vapor Mode**: Enable on render-heavy components for VDOM-less performance:
  ```ts
  <script setup lang="ts" vapor>
  // Compiled without Virtual DOM — no reactivity overhead
  </script>
  ```
- **Data Fetching**: Use `useFetch` with `server: false` for client-only tasks; prefer Server Functions for full type-safety end-to-end.
- **State**: Use `defineStore` (Pinia) for global state; use Nuxt's `useState` for simple shared state between server and client.
- **Type Safety**: `$fetch` is auto-typed from API routes — no manual type declarations needed for internal API calls.
