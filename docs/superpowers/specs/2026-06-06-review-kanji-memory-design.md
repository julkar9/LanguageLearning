# Review Kanji Memory

## Chosen Design

Keep the existing Daily Drill feedback panel unchanged, then render a separate `Kanji memory` section below the review-focus summary when the API returns `reviewFocus.kanjiFocus`. The section reuses the same kanji-focus fields already used by the Daily Word Pair kanji tab: kanji, radical, components, stroke count, optional stroke-order image, stroke steps, memory story, and source links.

The section also adds a YouTube search link for the current kanji plus "kanji stroke order story" so the learner can quickly find drawing/story videos without requiring the app to maintain fragile individual video IDs.

## Rejected Alternatives

- Changing the existing review summary was rejected because the user wanted that section preserved as-is.
- Adding a new API shape was rejected because the current review focus already carries kanji-focus data.
- Hard-coding one video per kanji was rejected because video availability and quality can drift; a targeted YouTube search is more durable.

## Verification

Add a component test proving a missed answer renders the existing review focus plus the new kanji memory section, then run the normal workspace checks, restart PM2, and verify `http://localhost:5173/study`.
