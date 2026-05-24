# Tech Stack Selection (2026)

> Default and alternative technology choices for web applications.

## Default Stack (Web App - 2026)

```yaml
Frontend:
  framework: Next.js 15 (App Router, Turbopack stable)
  language: TypeScript 5.x (strict mode)
  styling: Tailwind CSS v4 (CSS-first, no config file)
  state: React 19 Actions / Server Components
  bundler: Turbopack (stable for dev + build)

Backend:
  runtime: Node.js 22 LTS or Bun 1.x
  framework: Next.js Server Actions / Hono (Edge) / Elysia (Bun)
  validation: Zod

Database:
  primary: PostgreSQL
  orm: Drizzle (Edge/Bun) or Prisma (traditional Node.js)
  hosting: Neon (serverless) or Supabase

Auth:
  provider: Auth.js v5 (beta) or Clerk or Better-Auth

Monorepo:
  tool: Turborepo 2.x + pnpm workspaces
```

## Alternative Options

| Need | Default | Alternative |
|------|---------|-------------|
| Real-time | - | Supabase Realtime, Socket.io |
| File storage | - | Cloudinary, S3 |
| Payment | Stripe | LemonSqueezy, Paddle |
| Email | - | Resend, SendGrid |
| Search | - | Algolia, Typesense |
