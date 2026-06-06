# Study Cockpit Hands-Free Interactions

## Chosen Design

Add a shared, delegated dwell-activation controller to the Study Cockpit container. It watches real buttons and links inside the cockpit, arms only after the pointer rests on the same actionable element for 850 ms, cancels when the pointer leaves, and restarts the timer when the pointer keeps moving beyond a small tolerance. This gives mouse users a deliberate hover-to-activate path without making ordinary pointer movement fire controls.

Keep keyboard flow native where possible: Enter still submits the active quiz form while the learner is typing. After answer feedback is visible, Enter advances to the next Daily Drill item or Kana item. Feedback actions receive focus when they appear, so Tab and Enter also work through normal browser focus order.

## Rejected Alternatives

- Per-button dwell timers were rejected because they would duplicate behavior across tabs, quiz buttons, reading controls, and future cockpit actions.
- Automatic answer submission from a long hover over the input area was rejected because it could submit while the learner is still thinking or editing.
- Global hover activation across the whole site was rejected because the requested behavior belongs to the study cockpit, not every app surface.

## Verification

Add focused component tests for dwell activation cancellation/delay and Enter-to-advance after feedback. Then run the normal app checks, restart PM2, and verify `http://localhost:5173`.
