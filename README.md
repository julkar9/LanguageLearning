# LanguageLearning

Local full-stack Japanese study app built as a pnpm monorepo.

## Stack

- `apps/web`: Next.js 15 App Router, React 19, Tailwind CSS v4, React Query, ts-rest React Query
- `apps/api`: NestJS 11, ts-rest Nest handlers
- `packages/api-contract`: shared ts-rest contracts and Zod 4 schemas
- `packages/database`: Prisma 6 and PostgreSQL 15
- `packages/ui`: small shadcn-style UI package

## Local Setup

```bash
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open:

- Web: http://localhost:5173
- API health: http://localhost:5174/health
- PostgreSQL host port: `5175`

## Checks

```bash
pnpm test
pnpm run typecheck
pnpm run build
pnpm run pm2:restart
```

## Learning Notes

The shared contract is the source of truth for API types. The browser imports `@language-learning/api-contract` and `@language-learning/ui`; it does not import Prisma or `@language-learning/database`.

The API imports both the contract and database packages. NestJS receives HTTP requests, ts-rest validates the contract shape, services call Prisma, and Prisma talks to PostgreSQL.
