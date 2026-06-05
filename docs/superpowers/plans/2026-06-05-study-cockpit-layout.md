# Study Cockpit Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a compact tabbed cockpit so learners can switch between Daily Drill, Kana, Word Pair, and Memory without scrolling through one long feed.

**Architecture:** Keep the existing single-page React app and data flow. Add local UI state for the active cockpit panel and active word-pair subpanel, then conditionally render existing panels in one main stage.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, existing CSS.

---

## File Structure

- Modify `src/App.test.tsx`: add failing behavior tests for cockpit tabs, removed export button, and word-pair sub-tabs.
- Modify `src/App.tsx`: add tab state, compact header/status row, conditional panel rendering, Memory tab extraction, and Word Pair internal sub-tabs.
- Modify `src/styles.css`: replace the stacked feed layout with cockpit styling and responsive tabs.
- Create `AGENTS.md`: record the repo-local PM2 restart rule after completed implementations.

## Tasks

### Task 1: Cockpit Behavior Tests

- [ ] Add tests in `src/App.test.tsx` that expect no `Export memory` link, default Daily Drill tab content, and tab switching for Kana, Word Pair, and Memory.
- [ ] Run `npm test -- src/App.test.tsx` and confirm the new tests fail before implementation.

### Task 2: Cockpit React Implementation

- [ ] In `src/App.tsx`, remove the header export link.
- [ ] Add `activePanel` state with values `drill`, `kana`, `word`, and `memory`.
- [ ] Add a compact header and status chip row.
- [ ] Replace the stacked `.workspace` layout with a tab bar and a single active `.study-stage`.
- [ ] Move the memory sidebar markup into a reusable `MemoryPanel` rendered by the Memory tab.
- [ ] Add internal Word Pair sub-tabs for `English`, `Japanese`, `Kanji`, and `Examples`.
- [ ] Run `npm test -- src/App.test.tsx` and confirm the app tests pass.

### Task 3: Cockpit CSS

- [ ] In `src/styles.css`, reduce shell padding and `h1` size.
- [ ] Add styles for `.cockpit-summary`, `.study-tabs`, `.study-tab`, `.study-stage`, `.memory-strip`, and `.word-pair-tabs`.
- [ ] Remove or override the two-column sticky sidebar layout for the new cockpit.
- [ ] Run `npm test -- src/App.test.tsx` and `npm run typecheck`.

### Task 4: Agent Instructions

- [ ] Create `AGENTS.md` with repo-local rules: keep changes scoped, run verification, and always run `npm run pm2:restart` after completed implementations.

### Task 5: Final Verification

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `npm run pm2:restart`.
- [ ] Verify `http://localhost:5173/` returns HTTP 200.
- [ ] Browser-check the cockpit visually at `http://localhost:5173/`.
