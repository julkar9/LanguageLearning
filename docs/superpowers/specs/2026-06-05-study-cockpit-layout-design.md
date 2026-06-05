# Study Cockpit Layout Design

## Goal

Replace the long scrolling study feed with a compact cockpit that lets Julkarnine switch between Drill, Kana, Word Pair, and Memory without scrolling through every section.

## User Requirements

- Remove the visible `Export memory` button from the main UI.
- Shrink the oversized `Daily Drill` header so the first study card starts near the top of the page.
- Stop stacking Daily Drill, Kana Typing Quiz, Daily Word Pair, and Memory as separate vertical sections.
- Provide a more sophisticated navigation model, preferably tabs or page-like switching.
- Preserve all current study features: N1 Daily Drill, Kana Typing Quiz, memory tracking, mistake tracking, and Daily Word Pair.
- Update repo agent instructions so completed implementations always restart PM2.

## Chosen Design

Use a tabbed study cockpit. The top of the page becomes a compact header with a small title, a short learner-status line, and summary chips for current drill progress, kana progress, current daily word pair, and memory accuracy. Below that, a tab bar switches the main stage between `Daily Drill`, `Kana`, `Word Pair`, and `Memory`.

Only the active tab renders its full section. This removes the current long vertical feed while preserving direct access to every feature. The Memory section moves from a sticky sidebar into its own tab, with lightweight memory stats remaining visible in the summary chip row.

## Word Pair Handling

The Daily Word Pair remains rich but gets an internal segmented navigation: `English`, `Japanese`, `Kanji`, and `Examples`. This prevents the advanced language lesson from becoming a long scroll inside the new cockpit.

## Accessibility

Use real `button` elements with `role="tab"`, `aria-selected`, and keyboard-friendly focus styles. Keep form labels and submission flows unchanged.

## Testing

Update app tests to verify:

- The app opens on the Daily Drill cockpit tab.
- The export memory button is no longer visible.
- Switching to the Kana tab reveals the kana quiz.
- Switching to the Word Pair tab reveals the daily word-pair panel and its internal lesson tabs.
- Switching to the Memory tab reveals weak points and memory stats.

## Non-Goals

- Do not change spaced repetition scheduling.
- Do not change learner memory persistence.
- Do not change backend API shape.
- Do not add new dependencies.
