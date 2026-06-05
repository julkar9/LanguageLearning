# Next Nest Prisma Monorepo Design

## Goal

Convert LanguageLearning from a Vite React plus Express app into a pnpm workspace that teaches the modern full-stack pattern by example: Next.js web, NestJS API, ts-rest contracts, Prisma, PostgreSQL, and shared UI components.

## Chosen Approach

Use a `language-learning` monorepo with these workspaces:

- `apps/web`: Next.js 15 App Router, React 19, Tailwind CSS v4, React Query, and ts-rest React Query.
- `apps/api`: NestJS 11 API on port `5174`, with ts-rest route handlers.
- `packages/api-contract`: contract-first Zod schemas and ts-rest contracts.
- `packages/database`: Prisma 6 client, PostgreSQL schema, migrations, and seed script.
- `packages/ui`: minimal shadcn-style shared UI primitives and semantic CSS tokens.

The existing study cockpit stays as the primary learning app. It moves from Vite into Next.js and uses the API service instead of a colocated Express server. Existing learning data moves into PostgreSQL through Prisma seed data, including study items, kana quiz items, reading lab passages, daily word pairs, and learner memory. The sample `Task` resource is added as the first small end-to-end example for contract -> backend -> database -> frontend learning.

## Rejected Alternatives

1. Replace the current app with only a task demo. This is simpler, but it violates the repo rule to preserve N1 Daily Drill, Kana Typing Quiz, memory tracking, mistake tracking, Daily Word Pair, and Reading Lab.
2. Keep Vite and Express, then add Next/Nest later. This lowers migration risk, but it does not teach the target architecture now.
3. Move every nested lesson shape into highly normalized SQL tables immediately. This is overkill for the first migration and would make the learning app harder to read. JSON columns keep the TypeScript domain model recognizable while still putting persistence in PostgreSQL.

## Data Model

Prisma owns the database boundary. The first relational example is:

- `Task`: `id`, `title`, `done`, `createdAt`, `updatedAt`.

The learning app uses these persistence tables:

- `StudyItem`: one row per N1 drill item; nested examples and accepted answers stored as JSON.
- `KanaQuizItem`: one row per kana quiz card; accepted answers stored as JSON.
- `DailyWordPair`: one row per daily rich word pair; English and Japanese lesson objects stored as JSON.
- `ReadingLabPassage`: one row per reading lab passage; passage and analysis sections stored as JSON.
- `LearnerMemory`: one row for the local learner memory JSON object.

## API Design

The contract package defines schemas and routes. Both API and web import those contracts, so request and response shapes stay synchronized.

Task routes:

- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

Study routes preserve the current app behavior:

- `GET /study/session`
- `POST /study/reviews`
- `GET /study/word-pair`
- `GET /study/kana-quiz`
- `POST /study/kana-reviews`
- `GET /study/reading-lab`

The frontend imports `@language-learning/api-contract` and `@language-learning/ui`. It never imports `@language-learning/database`, Prisma, or `@prisma/client`.

## Frontend Design

The Next.js app has:

- `/`: redirects to `/study`.
- `/study`: current cockpit experience with Daily Drill, Kana, Reading Lab, Daily Word Pair, and Memory.
- `/tasks`: task list and create/update/delete flow using React Query loading and error states.

Interactive screens are client components. Next.js App Router provides route structure and layout, while React Query owns browser-side API state for this local app.

## Verification

Use pnpm only:

- `pnpm install`
- `docker compose up -d`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm test`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run pm2:restart`
- Verify `http://localhost:5173` and `http://localhost:5174/health`.
