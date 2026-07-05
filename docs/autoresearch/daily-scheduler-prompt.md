# LanguageLearning Daily JLPT Builder Scheduler Prompt

Use this file as the shared scheduled-task prompt for Codex, Antigravity, and
other agents running the LanguageLearning daily automation.

## Scheduler Stub

Use this short prompt in scheduler UIs:

```text
Start in /Users/julkarnine/www/LanguageLearning. Read AGENTS.md first. Then read and execute /Users/julkarnine/www/LanguageLearning/docs/autoresearch/daily-scheduler-prompt.md exactly. Treat that file as the shared source of truth for the daily LanguageLearning lesson and JLPT product-building run. If the file is unavailable, stop and report the missing path. Preserve learner state: do not delete, reset, stage, or rewrite data/learner-memory.json unless the user explicitly asks for a learner-memory migration in the current task.
```

## Purpose

Run one daily automation that does two jobs without confusing them:

1. Teach the user one practical, repo-grounded full-stack concept from this
   project.
2. Make one small, verified product improvement that gradually expands the app
   from the current N1-centered study cockpit toward durable N5, N4, N3, N2, and
   N1 coverage.

The automation should compound by improving the actual app, data, tests,
screenshots, and documentation one bounded step at a time.

## Required Context

Start every run by reading:

1. `AGENTS.md`
2. `README.md`
3. `package.json`
4. `apps/web/src/app/study/page.tsx`
5. `apps/web/src/features/study/study-cockpit.tsx`
6. `packages/api-contract/src/resources/study.ts`
7. `apps/api/src/study/study.controller.ts`
8. `apps/api/src/study/study.service.ts`
9. `apps/api/src/study/study-domain.ts`
10. `data/seed-items.json`
11. `data/daily-word-pairs.json`
12. `data/reading-lab-passages.json`
13. Relevant tests near the changed surface
14. `docs/superpowers/specs/2026-07-06-daily-jlpt-builder-automation-design.md`

Then inspect the current tree with:

```bash
git status --short
git rev-parse HEAD
```

## Dirty Tree Rules

- Never delete, reset, or stage `data/learner-memory.json`.
- If `data/learner-memory.json` is the only dirty file, continue with changes
  that do not touch it and keep it unstaged.
- If any other file is dirty before the run starts, stop before editing and
  report the paths unless the user explicitly asked to work with those changes.
- Never use destructive Git commands.

## Daily Product-Building Loop

Each run may make at most one coherent product improvement. Pick the highest
leverage item that can be verified today.

Preferred sequence:

1. Measure current JLPT coverage:
   - Which levels appear in schemas?
   - Which levels appear in seed items?
   - Which levels appear in word pairs?
   - Which levels appear in reading lab passages?
   - Which levels can the UI display or filter?
2. Choose one small improvement:
   - Expand level schema support from hard-coded `N1` to a typed JLPT level
     union.
   - Add a small, high-quality content slice for one missing level and one
     category.
   - Add level filtering or progress display to the study cockpit.
   - Add reading lab content for one level.
   - Add tests that prevent invalid level/content regressions.
   - Add screenshot or visual verification support for the study page.
   - Improve accessibility, responsive layout, or study flow ergonomics.
3. Write or update focused tests before or alongside the change.
4. Make the smallest app/data/docs change that satisfies the selected
   improvement.
5. Verify with the checks below.
6. Commit and push only if verification passes and the app responds locally when
   runtime code changed.

Do not bulk-generate every JLPT level in one run. The goal is durable,
reviewable progression.

## JLPT Expansion Strategy

Use this order unless repo evidence points to a better next step:

1. Platform readiness:
   - typed level model for `N5 | N4 | N3 | N2 | N1`
   - content validation
   - tests that prove mixed levels are accepted
2. Content foundation:
   - one verified vocabulary or grammar slice per run
   - one level at a time, starting with N2, then N3, N4, N5, while preserving N1
3. Study experience:
   - level tabs or filters
   - per-level progress and due counts
   - review queue that balances weak items with selected target level
4. Reading and kanji depth:
   - reading-lab passage per level
   - kanji/stroke/memory support where useful
5. Visual polish:
   - screenshots for changed study pages
   - responsive checks
   - accessibility checks for keyboard and focus behavior

If a run changes Japanese learning content, keep it useful and accurate:

- include Japanese, reading, meaning, accepted answers, explanation, keyboard
  tip, and at least one example where the existing schema requires it
- avoid fake citations or unverified claims
- prefer a small number of high-quality items over large generated lists
- keep examples natural and level-appropriate

## Teaching Lesson Contract

Every run still produces one short repo-grounded lesson for the user.

Keep this exact output shape:

- Today's concept
- Why it matters
- Mental model
- Repo walkthrough with file paths
- Request/data lifecycle
- Mermaid diagram
- Connection to Node.js/Vue.js
- Small exercise
- Verification commands
- Product improvement made today
- Tomorrow's suggested topic

Rules:

- Pick exactly one focused concept.
- Include exactly one Mermaid diagram in a fenced `mermaid` code block.
- Anchor the lesson to real LanguageLearning files and lifecycle steps.
- Teach from fundamentals for someone who knows plain Node.js and Vue.js but is
  newer to React, Next.js App Router, NestJS, Prisma, PostgreSQL, pnpm
  workspaces, and shared TypeScript packages.

## Visual Verification

For app or UI changes:

1. Run the verification commands below.
2. Restart the local PM2 app with `pnpm run pm2:restart`.
3. Verify the app responds at `http://localhost:5173`.
4. Capture or inspect a screenshot of the changed study surface when a browser
   or screenshot tool is available.
5. Save durable screenshots under `artifacts/autoresearch/` only when they are
   useful evidence; do not commit noisy screenshots by default unless the change
   intentionally adds a reference artifact.

If screenshot tooling is unavailable, report that clearly and rely on tests,
build, and localhost verification for that run.

## Verification

For runtime code, data, schema, or UI changes, run:

```bash
pnpm test
pnpm run typecheck
pnpm run build
pnpm run pm2:restart
```

Then verify:

```bash
curl -fsS http://localhost:5173 >/dev/null
```

For documentation-only scheduler prompt changes, run at minimum:

```bash
git diff --check
```

If the automation updates files, stage only the intended files. Do not stage
`data/learner-memory.json` unless explicitly requested.

## Commit Policy

When a daily implementation passes verification:

```bash
git add <intended files only>
git commit -m "auto: improve language learning product YYYY-MM-DD"
git push origin main
```

For prompt or workflow-only changes, use a specific docs message instead:

```bash
git commit -m "docs: centralize LanguageLearning daily scheduler prompt"
```

If commit or push is blocked, report the exact command and error.

## Final Response Requirements

End every run with:

- what changed
- what was intentionally left unchanged
- verification commands and results
- whether PM2/localhost/screenshot verification ran
- commit hash and push status, if committed
- the next best daily improvement
