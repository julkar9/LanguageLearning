# 🦸 Repo-Level Superpowers & Skills Registry

To build a state-of-the-art Japanese language learning application, we have established a strong set of local agentic **Superpowers** directly inside this repository. These skills enable continuous self-improvement, automated tuning, and high-fidelity feature development.

---

## 1. `superpowers:karpathy-autoresearch-loop` 🔄 [LIVE]

Inspired by Andrej Karpathy's AutoResearch concept, this is a **self-improving AI research loop** built into the repository. It automatically tests, logs, and optimizes core system parameters.

*   **Location**: [`scripts/autoresearch/`](file:///Users/julkarnine/www/LanguageLearning/scripts/autoresearch)
    *   **Evaluator**: [`evaluator.ts`](file:///Users/julkarnine/www/LanguageLearning/scripts/autoresearch/evaluator.ts) runs a multi-iteration pseudo-random learner simulator over 60 days, calculating a **Composite Evaluation Score** based on retention success vs review fatigue.
    *   **Loop Runner**: [`autoresearch.ts`](file:///Users/julkarnine/www/LanguageLearning/scripts/autoresearch/autoresearch.ts) proposes mutations (hypotheses), runs the evaluator, and uses a **ratchet mechanism** to accept improvements (by writing them back to the codebase) or discard regressions.
*   **How to run**:
    ```bash
    npx tsx scripts/autoresearch/autoresearch.ts
    ```
*   **Impact**: During initialization, it ran 10 trials, discovered that increasing the strength-3 interval from `7` to `8` days optimizes learning curve efficiency, and successfully committed that optimization to the live engine.

---

## 2. `superpowers:spaced-repetition-tuner` 📈

Extends the AutoResearch simulator to evaluate advanced mathematical models (e.g., Anki SM-2, Ebbinhaus Forgetting Curve) against the learning engine.

*   **Goal**: Automatically adjusts learning interval multipliers, mistake penalties, and initial ease factors.
*   **Day-by-Day Use**: Run after adding new study categories (like long reading passages or kanji writing) to optimize review frequencies for diverse item types.

---

## 3. `superpowers:interactive-mock-generator` ✍️

A generator skill designed to interface with LLMs to automatically expand our local curriculum.

*   **Goal**: Populates [`data/seed-items.json`](file:///Users/julkarnine/www/LanguageLearning/data/seed-items.json) and [`data/kana-quiz-items.json`](file:///Users/julkarnine/www/LanguageLearning/data/kana-quiz-items.json) with high-fidelity, contextual N1 vocabulary, grammar explanations, reading questions, and audio tip mappings.
*   **Day-by-Day Use**: Invoke when preparing to study new N1 blocks or targeted Kanji units to ensure rich, structured seed data.

---

## 4. `superpowers:a11y-keyboard-optimizer` ⌨️

An accessibility and input ergonomics auditor built for high-speed vocabulary drilling.

*   **Goal**: Audits IME (Japanese Input Method Editor) compositions, key bindings (e.g., using `Enter` for quick submit, `Space` for reveal, number keys for self-grading), and focus states.
*   **Day-by-Day Use**: Run this verification after making UI/UX modifications to prevent focus traps and ensure rapid hands-on-keyboard study flows.
