# Next Nest Prisma Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert LanguageLearning into a pnpm workspace with Next.js, NestJS, ts-rest, Prisma, PostgreSQL, and a contract-first task resource while preserving the study cockpit.

**Architecture:** The monorepo separates browser UI, API runtime, shared contracts, database access, and shared UI. The API is the only runtime that imports Prisma. The web app calls the API through ts-rest React Query clients.

**Tech Stack:** pnpm, TypeScript 5.9, ESLint 9, Next.js 15, React 19, Tailwind CSS v4, Radix/shadcn-style UI, NestJS 11, ts-rest, Zod 4, Prisma 6, PostgreSQL 15, Vitest, Testing Library, Supertest.

---

### Task 1: Workspace Skeleton

**Files:**
- Modify: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `eslint.config.mjs`
- Modify: `.gitignore`
- Modify: `ecosystem.config.cjs`

- [ ] Replace npm scripts with pnpm workspace scripts.
- [ ] Add TypeScript base config with strict settings.
- [ ] Add ESLint 9 flat config.
- [ ] Configure PM2 to run the API and web processes.

### Task 2: Contract Package

**Files:**
- Create: `packages/api-contract/package.json`
- Create: `packages/api-contract/src/index.ts`
- Create: `packages/api-contract/src/resources/tasks.ts`
- Create: `packages/api-contract/src/resources/study.ts`
- Create: `packages/api-contract/tsconfig.json`
- Create: `packages/api-contract/vitest.config.ts`
- Create: `packages/api-contract/src/resources/tasks.test.ts`

- [ ] Define Task schemas and contract routes.
- [ ] Define study schemas and contract routes.
- [ ] Export Zod from this package so apps do not import it directly.
- [ ] Test validation for create task input.

### Task 3: Database Package

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/prisma/schema.prisma`
- Create: `packages/database/prisma/migrations/20260605000000_initial/migration.sql`
- Create: `packages/database/src/client.ts`
- Create: `packages/database/src/index.ts`
- Create: `packages/database/src/seed.ts`
- Create: `packages/database/tsconfig.json`
- Create: `docker-compose.yml`
- Create: `.env.example`

- [ ] Add PostgreSQL 15 compose service on host port `5175`.
- [ ] Add Prisma 6 models for Task and study persistence.
- [ ] Seed tasks and existing learning JSON data.
- [ ] Keep learner memory data intact by reading the current JSON file during seed.

### Task 4: NestJS API

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/prisma.service.ts`
- Create: `apps/api/src/tasks.service.ts`
- Create: `apps/api/src/tasks.controller.ts`
- Create: `apps/api/src/study/study-domain.ts`
- Create: `apps/api/src/study/study.service.ts`
- Create: `apps/api/src/study/study.controller.ts`
- Create: `apps/api/test/tasks.e2e.test.ts`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/tsconfig.json`

- [ ] Implement health endpoint and CORS for local web.
- [ ] Implement task CRUD through ts-rest Nest handlers.
- [ ] Port the existing learning domain logic into the API.
- [ ] Implement study endpoints backed by Prisma tables.
- [ ] Add Supertest coverage for task list/create/update/delete.

### Task 5: UI Package

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/globals.css`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/components/button.tsx`
- Create: `packages/ui/src/components/input.tsx`
- Create: `packages/ui/src/components/card.tsx`
- Create: `packages/ui/src/components/dialog.tsx`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/tsconfig.json`

- [ ] Add semantic Tailwind CSS tokens.
- [ ] Add minimal shadcn-style Button, Input, Card, and Dialog components.
- [ ] Avoid hard-coded hex, rgb, or hsl values in component styles.

### Task 6: Next.js Web

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/study/page.tsx`
- Create: `apps/web/src/app/tasks/page.tsx`
- Create: `apps/web/src/components/providers.tsx`
- Create: `apps/web/src/features/study/study-cockpit.tsx`
- Create: `apps/web/src/features/tasks/tasks-client.tsx`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/app/tasks/page.test.tsx`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/vitest.setup.ts`

- [ ] Preserve Daily Drill, Kana Typing Quiz, Reading Lab, Daily Word Pair, Memory, and mistake tracking.
- [ ] Add `/tasks` with loading, error, create, toggle, and delete flows.
- [ ] Use React Query and ts-rest React Query for API state.
- [ ] Use shared UI components and semantic tokens.

### Task 7: Docs, Verification, Commit, Push

**Files:**
- Create: `README.md`
- Remove: npm/Vite/Express-only files that are replaced by the monorepo.

- [ ] Document local-only setup commands.
- [ ] Run install, database generation, migration, seed, tests, typecheck, build, PM2 restart, and HTTP checks.
- [ ] Commit and push only if all required checks pass.
