import { describe, expect, it } from "vitest";
import { evaluateKanaAnswer, selectKanaQuiz } from "./kanaQuiz";
import type { KanaQuizItem, LearnerMemory } from "./types";

const items: KanaQuizItem[] = [
  {
    id: "hiragana-kya",
    script: "hiragana",
    prompt: "Type kya in hiragana.",
    target: "きゃ",
    acceptedAnswers: ["きゃ"],
    romaji: "kya",
    keyboardTip: "Type k-y-a to produce きゃ.",
    explanation: "き + small ゃ becomes kya."
  },
  {
    id: "katakana-coffee",
    script: "katakana",
    prompt: "Type coffee in katakana.",
    target: "コーヒー",
    acceptedAnswers: ["コーヒー", "コーヒ"],
    romaji: "ko-hi-",
    keyboardTip: "Type ko-hi- for コーヒー. The hyphen creates the long vowel mark ー in katakana.",
    explanation: "Katakana loanwords often use ー for long vowels."
  }
];

function memory(): LearnerMemory {
  return {
    learner: {
      displayName: "Julkarnine",
      japaneseLevel: "N2 passed; preparing for N1",
      explanationLanguage: "English"
    },
    taughtItemIds: [],
    reviews: [],
    itemStats: {},
    mistakes: [],
    kanaReviews: [],
    lastSessionAt: null
  };
}

describe("evaluateKanaAnswer", () => {
  it("accepts exact kana and returns keyboard guidance", () => {
    const feedback = evaluateKanaAnswer(items[0], " きゃ ");

    expect(feedback.correct).toBe(true);
    expect(feedback.normalizedAnswer).toBe("きゃ");
    expect(feedback.keyboardTip).toContain("k-y-a");
  });

  it("corrects kana mistakes without accepting romaji as the answer", () => {
    const feedback = evaluateKanaAnswer(items[1], "ko-hi-");

    expect(feedback.correct).toBe(false);
    expect(feedback.expected).toBe("コーヒー");
    expect(feedback.explanation).toContain("Katakana");
  });
});

describe("selectKanaQuiz", () => {
  it("prioritizes recently missed kana patterns", () => {
    const learnerMemory = memory();
    learnerMemory.kanaReviews = [
      {
        itemId: "katakana-coffee",
        answeredAt: "2026-05-28T08:00:00.000Z",
        answer: "こひ",
        correct: false,
        expected: "コーヒー"
      }
    ];

    const quiz = selectKanaQuiz(items, learnerMemory, { limit: 2 });

    expect(quiz[0].id).toBe("katakana-coffee");
    expect(quiz).toHaveLength(2);
  });
});

