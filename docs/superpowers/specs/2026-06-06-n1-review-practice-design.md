# N1 Review Practice

## Chosen Design

Add a separate `N1 practice` card below `KANJI MEMORY` in the missed-answer feedback panel. The card uses the existing `reviewFocus.examples` and `reviewFocus.extraExamples` returned by the API, so the practice stays tied to the word and kanji the learner just missed.

The card includes a short Japanese reading paragraph, reading support in kana when available, an English translation, vocabulary-in-context examples, and a grammar/usage cue. The grammar cue is intentionally lightweight and pattern-based, with special handling for common forms such as i-adjectives, suru-verbs, and verbs. This keeps the feature useful without adding a new API or generated-content dependency.

## Rejected Alternatives

- Changing the existing review summary or `KANJI MEMORY` card was rejected because both are already working and should remain stable.
- Adding a new backend generation step was rejected because the current review-focus payload already has examples, readings, meanings, and context.
- Hard-coding content only for `甚だしい` was rejected because the card should work for every missed item that has review-focus examples.

## Verification

Add a component test for the new N1 practice card, then run the normal workspace verification, restart PM2, and verify the local app at `http://localhost:5173/study`.
