---
name: app-builder
description: Main application building orchestrator. Creates full-stack applications from natural language requests. Determines project type, selects tech stack, coordinates agents.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# App Builder - Application Building Orchestrator

> Analyzes user's requests, determines tech stack, plans structure, and coordinates agents.

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map, find what you need.

| File | Description | When to Read |
|------|-------------|--------------|
| `project-detection.md` | Keyword matrix, project type detection | Starting new project |
| `tech-stack.md` | 2026 default stack, alternatives | Choosing technologies |
| `agent-coordination.md` | Agent pipeline, execution order | Coordinating multi-agent work |
| `scaffolding.md` | Directory structure, core files | Creating project structure |
| `feature-building.md` | Feature analysis, error handling | Adding features to existing project |
| `templates/SKILL.md` | **Project templates** | Scaffolding new project |

---

## 📦 Templates (13)

Quick-start scaffolding for new projects. **Read the matching template only!**

| Template | Tech Stack | When to Use |
|----------|------------|-------------|
| [nextjs-fullstack](templates/nextjs-fullstack/TEMPLATE.md) | Next.js 15 + Prisma + Tailwind v4 | Full-stack web app |
| [nextjs-saas](templates/nextjs-saas/TEMPLATE.md) | Next.js 15 + Stripe + Auth.js | SaaS product |
| [nextjs-static](templates/nextjs-static/TEMPLATE.md) | Next.js 15 + Framer Motion | Landing page |
| [nuxt-app](templates/nuxt-app/TEMPLATE.md) | Nuxt 4 + Pinia + Tailwind v4 | Vue full-stack app |
| [astro-static](templates/astro-static/TEMPLATE.md) | Astro 5 + MDX + Tailwind | Content site / blog / docs |
| [express-api](templates/express-api/TEMPLATE.md) | Express + Zod + JWT (Node 22/Bun) | REST API |
| [python-fastapi](templates/python-fastapi/TEMPLATE.md) | FastAPI + SQLAlchemy 2 + Pydantic v2 | Python API |
| [react-native-app](templates/react-native-app/TEMPLATE.md) | Expo SDK 53 + Zustand + Expo Router | Mobile app (RN) |
| [flutter-app](templates/flutter-app/TEMPLATE.md) | Flutter 3.x + Riverpod + Go Router | Cross-platform mobile |
| [electron-desktop](templates/electron-desktop/TEMPLATE.md) | Electron 33 + React 19 + Vite | Desktop app |
| [chrome-extension](templates/chrome-extension/TEMPLATE.md) | Chrome MV3 + React 19 + Vite | Browser extension |
| [cli-tool](templates/cli-tool/TEMPLATE.md) | Node 22/Bun + Commander.js | CLI app |
| [monorepo-turborepo](templates/monorepo-turborepo/TEMPLATE.md) | Turborepo 2.x + pnpm workspaces | Monorepo |

---

## 🔗 Related Agents

| Agent | Role |
|-------|------|
| `project-planner` | Task breakdown, dependency graph |
| `frontend-specialist` | UI components, pages |
| `backend-specialist` | API, business logic |
| `database-architect` | Schema, migrations |
| `devops-engineer` | Deployment, preview |

---

## Usage Example

```
User: "Make an Instagram clone with photo sharing and likes"

App Builder Process:
1. Project type: Social Media App
2. Tech stack: Next.js + Prisma + Cloudinary + Clerk
3. Create plan:
   ├─ Database schema (users, posts, likes, follows)
   ├─ API routes (12 endpoints)
   ├─ Pages (feed, profile, upload)
   └─ Components (PostCard, Feed, LikeButton)
4. Coordinate agents
5. Report progress
6. Start preview
```
