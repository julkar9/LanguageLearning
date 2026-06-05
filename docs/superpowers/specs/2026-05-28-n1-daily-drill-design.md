# N1 Daily Drill Design

## Goal

Build a personal local web app for N1 preparation. The first screen is a daily mixed drill that remembers taught items, mistakes, review intervals, and typing corrections in this repository.

## Recommended Approach

Use a React/Vite app served by a small local Express server. The browser gives a fast daily study interface, while Express persists learner memory to `data/learner-memory.json` so the repository remains the source of truth for what has already been taught and quizzed.

## First Version Scope

- Daily Drill is the entry screen.
- Session mix includes N1 vocabulary, kanji/kana typing, grammar patterns, and short reading.
- The app chooses due and weak items first, then introduces new items.
- After each answer, the app stores whether the user was correct, the typed answer, next review time, strength, and mistake history.
- Feedback includes a correction, a short explanation, and keyboard input guidance for kana/kanji typing.
- A memory panel shows taught items, due items, weak points, and recent mistakes.

## Out Of Scope For First Version

- User accounts, cloud sync, authentication, and external APIs.
- Full JLPT content database.
- Handwriting recognition. Keyboard input practice is included first.

