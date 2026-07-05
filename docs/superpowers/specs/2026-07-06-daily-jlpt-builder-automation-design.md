# Daily JLPT Builder Automation Design

## Goal

Turn the existing teaching-only LanguageLearning automation into a daily
lesson-and-product-builder loop. Each run should still teach one practical
repo-grounded concept, but it may also make one small verified improvement to
expand the app from the current N1-centered cockpit toward complete N5, N4, N3,
N2, and N1 coverage.

## Current State

- The study cockpit is centered on N1 copy and content.
- `StudyItemSchema.level` and reading-lab difficulty currently accept only
  `N1`.
- Seed content, word pairs, and reading passages are N1-focused.
- The daily scheduler prompt is currently teaching-only and does not direct
  agents to improve the product.
- Learner memory is runtime state and must not be reset, deleted, or staged by
  autonomous runs.

## Chosen Approach

Use a guarded daily improvement loop:

1. Measure the current level coverage across schema, content, UI, and tests.
2. Choose one small, coherent improvement.
3. Add or update focused tests.
4. Make the minimum app, data, or docs change.
5. Run verification.
6. Commit and push only verified changes.

The first durable product improvements should prepare the data model and UI for
multiple JLPT levels before adding large amounts of content. Once the platform
supports mixed levels, daily runs can add one high-quality content slice at a
time.

## Rejected Alternatives

- Bulk-generate N5 through N1 content in one run. This would likely create weak
  examples, shallow explanations, and a large review burden.
- Let the scheduler freely edit any file. The repo contains learner memory and
  runtime process files that need explicit protection.
- Replace the teaching workflow with only product automation. The user still
  benefits from one repo-grounded lesson per run.
- Add screenshot artifacts for every run by default. Screenshots should be used
  for UI evidence, but noisy binary churn should not be committed unless it is
  intentional.

## Acceptance Gate

A daily product improvement is acceptable only when:

- learner memory is preserved
- exactly one coherent improvement was made
- tests/typecheck/build pass for app changes
- PM2 and localhost verification pass for runtime changes
- screenshot or visual inspection is performed for UI changes when tooling is
  available
- the final response includes the next best daily improvement
