# Project Overview: diplom_work

A modern full-stack TypeScript monorepo built on the **Better-T-Stack**. It features a Next.js application, a type-safe tRPC API, Drizzle ORM for database management, and Better-Auth for authentication.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19/16.1.6+)
- **Monorepo Tooling**: [Turborepo](https://turbo.build/), [pnpm](https://pnpm.io/)
- **API**: [tRPC](https://trpc.io/) (v11)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/), [PostgreSQL](https://www.postgresql.org/) (supports Neon or generic PG)
- **Authentication**: [Better-Auth](https://better-auth.com/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) (v4), [shadcn/ui](https://ui.shadcn.com/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Project Structure
- `apps/web`: The main Next.js web application.
- `packages/api`: tRPC routers and server-side logic (achievements, experts, profiles, reports, scripts, sessions, users).
- `packages/auth`: Authentication configuration using Better-Auth with Drizzle adapter and custom roles.
- `packages/db`: Drizzle schema definitions and migrations.
- `packages/domain`: Core domain logic, shared types, and custom errors.
- `packages/env`: Type-safe environment variable management (server and client).
- `packages/config`: Shared configurations (e.g., Vitest).
- `packages/email`: Email delivery logic.
- `packages/file`: File handling utilities.
- `packages/logger`: Pino-based logging.
- `packages/ratelimit`: Rate limiting configuration.
- `packages/healthcheck`: Health monitoring.

## Building and Running

### Prerequisites
- [pnpm](https://pnpm.io/installation)
- PostgreSQL database

### Setup
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Configure environment variables:
   - Copy `.env.example` in `apps/web` and root if applicable (check `packages/env`).
   - Essential: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGIN`.

### Common Commands
- **Development**: `pnpm run dev` (starts web app and all services)
- **Build**: `pnpm run build`
- **Lint & Format**: `pnpm run check` (Biome)
- **Database Operations**:
  - `pnpm run db:push`: Push local schema changes directly to DB.
  - `pnpm run db:generate`: Generate migrations.
  - `pnpm run db:migrate`: Run migrations.
  - `pnpm run db:studio`: Open Drizzle Studio UI.
- **Testing**:
  - `pnpm run test`: Run all tests.
  - `pnpm run test:coverage`: Run tests with coverage reporting.

## Development Conventions
- **Type Safety**: Use TypeScript for everything. Leverage Zod for validation and environment variables.
- **Styling**: Prefer TailwindCSS v4 and shadcn components. Use `cn` utility for class merging.
- **API**: Add new tRPC procedures in `packages/api/src/routers`. Keep logic in separate router files.
- **Database**: Define new tables in `packages/db/src/schema/scheme.ts` (or relevant files in `schema/`).
- **Commits**: Follow clear and concise commit messages.
- **Formatting**: Rely on Biome (`pnpm run check`) for linting and formatting.
- **Testing**: Write unit/integration tests with Vitest in `.test.ts` files alongside implementation.
