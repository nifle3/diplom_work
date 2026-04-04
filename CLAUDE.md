# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered interview/assessment platform built on the Better-T-Stack. Users conduct AI-guided interview sessions against scripts authored by experts, with LLM-driven question planning, answer evaluation, and session summarization.

## Commands

### Development
```bash
pnpm install          # Install all dependencies
pnpm run dev          # Start all apps (web on :3001)
```

### Database
```bash
pnpm run db:start     # Start PostgreSQL via Docker Compose
pnpm run db:push      # Apply schema changes (Drizzle push)
pnpm run db:generate  # Generate migration files
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio UI
```

### Build & Type Check
```bash
pnpm run build        # Build all apps
pnpm run check-types  # TypeScript check across workspace
```

### Testing
```bash
pnpm run test                                          # Run all tests (Vitest)
pnpm run test:coverage                                 # Generate coverage reports
turbo run test --filter=@diplom_work/api               # Test a specific package
```

### Linting & Formatting
```bash
pnpm run check        # Biome check with auto-fix
```

## Architecture

### Monorepo Structure

- **`apps/web`** — Next.js 16 full-stack app (App Router). Routes are grouped by role: `(auth)/` for authenticated users, `(expert)/` for experts, `(unauth)/` for public, `admin/` for admins.
- **`packages/api`** — tRPC routers with all business logic. One router per domain: `session`, `script`, `expert`, `user`, `achievement`, `report`, `file`, `category`, etc.
- **`packages/db`** — Drizzle ORM schema for PostgreSQL (`scheme.ts` + `auth.ts`).
- **`packages/auth`** — Better-Auth configuration with custom roles (user, expert, admin).
- **`packages/llm`** — LLM integration: `evaluater/`, `interviewer/`, `summarization/`, using the Vercel `ai` library with Zod-validated structured outputs.
- **`packages/file`** — S3 file storage abstraction (upload, delete, link generation).
- **`packages/env`** — Type-safe env vars via `t3-oss/env-core` with Zod validation. Fails fast on missing vars.
- **`packages/domain`** — Shared enums, custom error classes (no logic, no deps).
- **`packages/email`** — Resend email provider with templates.
- **`packages/ratelimit`** — Upstash Redis rate limiting.
- **`packages/logger`** — Pino-based structured logging.

### tRPC Middleware Pipeline

All tRPC procedures pass through:
```
publicProcedure / protectedProcedure
  → requestIdLogger → logger → rateLimit → hasRole → error handler → procedure
```

Context (injected via `packages/api/src/init/`) contains: `auth`, `db`, `file`, `llm`, `session`, `requestId`, `clientIp`.

### Interview Session Flow

1. `sessionRouter.createNewSession(scriptId)` — fetches script, LLM generates first question
2. `sessionRouter.addNewMessage(sessionId, answer)` — LLM evaluates answer, plans next question
3. On completion — LLM evaluates entire session, XP/achievements calculated and synced

### Code Quality

- **Biome** enforces: tabs for indentation, double quotes, strict linting (no unused vars, use enums). Sorts Tailwind classes via `cn`, `clsx`, `cva`.
- **TypeScript** strict mode across all packages.

## Key Conventions

- Database: soft deletes via `deletedAt` column; all tables have `createdAt`/`updatedAt`.
- Errors: use custom error classes from `packages/domain/src/error/` in router logic.
- Environment: add new vars to both `packages/env/src/server.ts` or `packages/env/src/web.ts` and validate with Zod.
- New tRPC procedures: place in the relevant router file; use `protectedProcedure` for authenticated routes, add `hasRole` middleware for role-restricted ones.
