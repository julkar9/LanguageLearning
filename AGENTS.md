# LanguageLearning Agent Instructions

## Scope

These instructions apply to the local LanguageLearning app in `/Users/julkarnine/www/LanguageLearning`.

## Development Rules

- Keep changes focused on the requested learning or app improvement.
- Preserve the existing study surfaces unless the user explicitly asks to remove them: N1 Daily Drill, Kana Typing Quiz, memory tracking, mistake tracking, and Daily Word Pair.
- Prefer small, testable React, TypeScript, CSS, and data changes over broad rewrites.
- Do not delete or reset learner memory.

## Verification

Before reporting a completed implementation, run the relevant local checks. For normal app changes, use:

```bash
npm test
npm run typecheck
npm run build
```

After every completed implementation, restart the local PM2 app:

```bash
npm run pm2:restart
```

Then verify the local app responds at `http://localhost:5173`.

After verification and PM2 restart, commit the completed implementation and push it to the GitHub remote when one is configured. Do not push if tests, typecheck, build, PM2 restart, or localhost verification fail.
