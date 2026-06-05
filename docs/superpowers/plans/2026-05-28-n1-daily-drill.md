# N1 Daily Drill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local N1 Daily Drill app with repo-backed learning memory.

**Architecture:** A React/Vite frontend calls a local Express API. The API reads seed study items from `data/seed-items.json` and persists learner state to `data/learner-memory.json`. Core scheduling and answer-checking logic lives in pure TypeScript under `src/domain` and is covered by Vitest tests.

**Tech Stack:** React, TypeScript, Vite, Express, Vitest, Testing Library.

---

### Task 1: Learning Engine

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/learningEngine.ts`
- Create: `src/domain/learningEngine.test.ts`

- [ ] Write tests for balanced due-item session generation, answer normalization, keyboard tips, and memory updates.
- [ ] Run `npm test -- src/domain/learningEngine.test.ts` and confirm the tests fail because the engine does not exist.
- [ ] Implement the smallest pure functions needed to pass: `buildDailySession`, `evaluateAnswer`, and `recordReview`.
- [ ] Re-run the targeted tests and confirm they pass.

### Task 2: Repo-Backed Memory API

**Files:**
- Create: `server/index.ts`
- Create: `data/seed-items.json`
- Create: `data/learner-memory.json`

- [ ] Add N1 seed content across vocabulary, kanji, grammar, and reading.
- [ ] Add Express endpoints for `GET /api/session`, `POST /api/reviews`, and `GET /api/export`.
- [ ] Persist every review back to `data/learner-memory.json`.

### Task 3: Daily Drill UI

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] Render Daily Drill as the first screen.
- [ ] Add answer input, feedback, next-question flow, memory panel, and progress stats.
- [ ] Keep the UI dense, calm, and optimized for repeated daily use.

### Task 4: Verification

**Files:**
- Modify: project root config as needed.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev`.
- [ ] Verify the app in the browser at the local URL.

