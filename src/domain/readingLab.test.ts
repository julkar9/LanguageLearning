import { describe, expect, it } from "vitest";
import { selectReadingLabPassage } from "./readingLab";
import type { ReadingLabPassage } from "./types";

const passages: ReadingLabPassage[] = [
  {
    id: "policy-transparency",
    title: "制度の透明性と説明責任",
    theme: "Policy critique",
    difficulty: "N1",
    estimatedMinutes: 14,
    focus: "Track contrast, concession, and the author's final judgment.",
    passage: ["第一段落", "第二段落"],
    argumentMap: [
      { label: "Problem", content: "Users accept burden only when the purpose is clear." },
      { label: "Conclusion", content: "Transparency must be designed before enforcement." }
    ],
    discourseMarkers: [{ marker: "とはいえ", function: "concession", cue: "The author limits the previous claim." }],
    vocabulary: [{ expression: "説明責任", reading: "せつめいせきにん", meaning: "accountability", note: "Used in policy and business." }],
    traps: [
      {
        label: "Too strong",
        trap: "The author rejects all new rules.",
        whyItFails: "The passage criticizes unexplained rules, not rules themselves.",
        repair: "Keep the contrast between burden and explanation."
      }
    ],
    questions: [
      {
        prompt: "筆者の主張に最も近いものはどれか。",
        choices: ["Rules should be abolished.", "Explanation must precede enforcement.", "Users dislike all change."],
        answerIndex: 1,
        explanation: "The author accepts rules when their purpose is explainable."
      }
    ],
    paraphrases: [
      {
        original: "負担を求める前に、目的を共有する必要がある。",
        paraphrase: "手続きの理由が伝わらなければ、協力は得にくい。",
        note: "N1 paraphrases often replace concrete words with abstract policy language."
      }
    ],
    rereadPlan: [
      { pass: "First pass", minutes: 4, goal: "Mark contrast markers." },
      { pass: "Second pass", minutes: 5, goal: "Match each paragraph to its role." }
    ],
    summaryChallenge: "Summarize the author's claim in one Japanese sentence."
  },
  {
    id: "workplace-evaluation",
    title: "評価制度と納得感",
    theme: "Workplace analysis",
    difficulty: "N1",
    estimatedMinutes: 12,
    focus: "Separate the author's claim from the example.",
    passage: ["第一段落"],
    argumentMap: [{ label: "Claim", content: "Fairness needs visible criteria." }],
    discourseMarkers: [],
    vocabulary: [],
    traps: [],
    questions: [
      {
        prompt: "筆者の考えはどれか。",
        choices: ["Visibility matters.", "Speed matters."],
        answerIndex: 0,
        explanation: "The passage emphasizes visible criteria."
      }
    ],
    paraphrases: [],
    rereadPlan: [],
    summaryChallenge: "State the claim."
  }
];

describe("selectReadingLabPassage", () => {
  it("cycles through N1 reading lab passages by local day", () => {
    const first = selectReadingLabPassage(passages, new Date("2026-06-05T09:00:00+09:00"));
    const second = selectReadingLabPassage(passages, new Date("2026-06-06T09:00:00+09:00"));

    expect(first.id).not.toBe(second.id);
    expect([first.id, second.id].sort()).toEqual(["policy-transparency", "workplace-evaluation"]);
  });

  it("requires at least one reading lab passage", () => {
    expect(() => selectReadingLabPassage([])).toThrow("At least one reading lab passage is required.");
  });
});
