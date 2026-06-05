# N1 Reading Lab Design

## Brainstormed Expert Ideas

1. Reading Lab with passage, argument map, traps, paraphrases, and reread plan.
2. Trap-answer trainer focused on overstatement, timing errors, and keyword-only choices.
3. Paraphrase matcher for N1 abstract rewording.
4. Argument-map drills for thesis, concession, reason, and conclusion.
5. Time-boxed reread cycles for first pass, structure pass, and answer validation.
6. Dense kanji-in-context review from reading passages.
7. Discourse-marker mining for turns such as とはいえ, むしろ, したがって.
8. Abstract-summary compression from long Japanese passages into one sentence.
9. Native-register comparison between casual explanation and exam-style prose.
10. Learner-memory-driven passage selection based on missed vocabulary and grammar.

## Selected Implementation

Build the Reading Lab first because it combines the highest-value N1 reading skills in one surface. The initial version is data-driven and non-destructive: it loads a daily N1 passage, shows the passage text, argument map, discourse markers, vocabulary, trap analysis, paraphrase recognition, reread cycle, and a reveal-only answer check that does not write to learner memory.

## Scope

- Add `data/reading-lab-passages.json`.
- Add typed `ReadingLabPassage` interfaces and a daily selector.
- Serve `/api/reading-lab`.
- Add a fifth cockpit tab, `Reading Lab`.
- Preserve the existing Drill, Kana, Word Pair, and Memory surfaces.
- Verify with tests, typecheck, build, PM2 restart, localhost check, browser smoke test, commit, and push.
