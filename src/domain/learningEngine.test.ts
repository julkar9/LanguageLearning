import { describe, expect, it } from "vitest";
import {
  buildDailySession,
  evaluateAnswer,
  getMemorySummary,
  recordReview
} from "./learningEngine";
import type { LearnerMemory, StudyItem } from "./types";

const now = new Date("2026-05-28T09:00:00+09:00");

const items: StudyItem[] = [
  {
    id: "vocab-kenen",
    category: "vocabulary",
    level: "N1",
    prompt: "懸念",
    reading: "けねん",
    meaning: "concern; worry",
    acceptedAnswers: ["けねん", "concern", "worry"],
    explanation: "懸念 means a serious concern or worry.",
    keyboardTip: "Type ke-n-e-n. Use n twice only when you need ん before a vowel.",
    examples: [{ japanese: "安全性への懸念が高まった。", english: "Concerns about safety increased." }]
  },
  {
    id: "kanji-shiki",
    category: "kanji",
    level: "N1",
    prompt: "識",
    reading: "しき",
    meaning: "knowledge; recognition",
    acceptedAnswers: ["しき", "knowledge", "recognition"],
    explanation: "識 appears in 知識, 認識, and 常識.",
    keyboardTip: "Type shi-ki for しき.",
    examples: [{ japanese: "認識を改める。", english: "Revise one's understanding." }]
  },
  {
    id: "grammar-yogi",
    category: "grammar",
    level: "N1",
    prompt: "〜を余儀なくされる",
    reading: "をよぎなくされる",
    meaning: "to be forced to",
    acceptedAnswers: ["forced to", "be forced to", "をよぎなくされる"],
    explanation: "Used when outside circumstances force an action or state.",
    keyboardTip: "For ぎ type gi. For なく type na-ku.",
    examples: [{ japanese: "悪天候で中止を余儀なくされた。", english: "Bad weather forced the cancellation." }]
  },
  {
    id: "reading-policy",
    category: "reading",
    level: "N1",
    prompt: "短文: 新制度の目的は、利用者の負担を増やすことではなく、手続きの透明性を高めることにある。",
    reading: "しんせいど",
    meaning: "The new system aims to improve transparency, not increase user burden.",
    acceptedAnswers: ["transparency", "透明性", "improve transparency", "手続きの透明性"],
    explanation: "The key contrast is 負担を増やすことではなく ... 透明性を高める.",
    keyboardTip: "透明性 is typed tou-mei-sei.",
    examples: [{ japanese: "何を高めることが目的ですか。", english: "What is the system intended to improve?" }]
  }
];

function emptyMemory(): LearnerMemory {
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

describe("buildDailySession", () => {
  it("prioritizes due weak items while preserving a balanced N1 mix", () => {
    const memory = emptyMemory();
    memory.taughtItemIds = ["vocab-kenen", "kanji-shiki", "grammar-yogi"];
    memory.itemStats = {
      "vocab-kenen": {
        itemId: "vocab-kenen",
        strength: 0,
        seenCount: 3,
        correctCount: 1,
        incorrectCount: 2,
        nextReviewAt: "2026-05-27T09:00:00.000Z",
        lastReviewedAt: "2026-05-27T08:00:00.000Z"
      },
      "kanji-shiki": {
        itemId: "kanji-shiki",
        strength: 1,
        seenCount: 2,
        correctCount: 1,
        incorrectCount: 1,
        nextReviewAt: "2026-05-28T00:00:00.000Z",
        lastReviewedAt: "2026-05-27T08:00:00.000Z"
      },
      "grammar-yogi": {
        itemId: "grammar-yogi",
        strength: 4,
        seenCount: 5,
        correctCount: 5,
        incorrectCount: 0,
        nextReviewAt: "2026-06-05T00:00:00.000Z",
        lastReviewedAt: "2026-05-27T08:00:00.000Z"
      }
    };

    const session = buildDailySession(items, memory, now, { limit: 4 });

    expect(session.items.map((item) => item.id)).toEqual([
      "vocab-kenen",
      "kanji-shiki",
      "reading-policy",
      "grammar-yogi"
    ]);
    expect(session.focusNote).toContain("weak");
    expect(session.categoryCounts).toEqual({
      vocabulary: 1,
      kanji: 1,
      grammar: 1,
      reading: 1
    });
  });

  it("keeps the default daily session balanced when plenty of items exist", () => {
    const manyItems = [
      ...makeItems("vocabulary", 8),
      ...makeItems("kanji", 6),
      ...makeItems("grammar", 6),
      ...makeItems("reading", 6)
    ];

    const session = buildDailySession(manyItems, emptyMemory(), now);
    const counts = Object.values(session.categoryCounts);

    expect(session.items).toHaveLength(14);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });
});

describe("evaluateAnswer", () => {
  it("accepts kana readings and gives typing guidance for mistakes", () => {
    const correct = evaluateAnswer(items[1], " しき ");
    const incorrect = evaluateAnswer(items[1], "しぎ");

    expect(correct.correct).toBe(true);
    expect(correct.normalizedAnswer).toBe("しき");
    expect(incorrect.correct).toBe(false);
    expect(incorrect.expected).toContain("しき");
    expect(incorrect.keyboardTip).toContain("shi-ki");
  });

  it("accepts English meaning answers case-insensitively", () => {
    const result = evaluateAnswer(items[0], "Concern");

    expect(result.correct).toBe(true);
  });

  it("adds rich kanji review focus when a drill item matches a daily word pair", () => {
    const feedback = evaluateAnswer(
      {
        id: "vocab-jouho",
        category: "vocabulary",
        level: "N1",
        prompt: "譲歩",
        reading: "じょうほ",
        meaning: "concession; compromise",
        acceptedAnswers: ["じょうほ", "concession", "compromise"],
        explanation: "譲歩 is a concession made during conflict, negotiation, or debate.",
        keyboardTip: "Type jo-u-ho for じょうほ.",
        examples: [{ japanese: "双方が譲歩しなければ合意は難しい。", english: "Agreement is difficult unless both sides compromise." }]
      },
      "shiko",
      [
        {
          id: "pragmatic-jouho",
          title: "Pragmatic / 譲歩",
          english: {
            word: "pragmatic",
            meaning: "focused on what works",
            simpleExplanation: "Pragmatic means practical.",
            banglaMeaning: "বাস্তববাদী",
            sentences: [],
            synonyms: [],
            opposite: "idealistic",
            speakingChallenge: ""
          },
          japanese: {
            word: "譲歩",
            reading: "じょうほ",
            meaning: "concession; compromise",
            simpleExplanation: "譲歩 is giving some ground so both sides can move forward.",
            banglaMeaning: "ছাড়; সমঝোতা",
            sentences: [
              {
                japanese: "双方が譲歩しなければ合意は難しい。",
                reading: "そうほうがじょうほしなければごういはむずかしい。",
                english: "Agreement is difficult unless both sides make concessions."
              }
            ],
            extraExamples: [
              { japanese: "譲歩案", reading: "じょうほあん", english: "compromise proposal" },
              { japanese: "譲歩の余地", reading: "じょうほのよち", english: "room for compromise" }
            ],
            synonyms: ["妥協"],
            opposite: "強硬",
            speakingChallenge: "",
            kanjiFocus: {
              kanji: "譲",
              radical: "言（ごんべん）",
              components: ["言", "㐮"],
              strokeCount: 20,
              strokeOrderImagePath: "/artifacts/jou_stroke_order.svg",
              strokeSteps: ["Write 言 on the left.", "Build 㐮 on the right."],
              memoryStory: "Negotiation words create enough room to yield one step.",
              sourceLinks: ["https://kakijun.com/c/8b72.html"]
            }
          },
          microStory: "A pragmatic manager made one small 譲歩."
        }
      ]
    );

    expect(feedback.reviewFocus).toMatchObject({
      word: "譲歩",
      reading: "じょうほ",
      kanjiFocus: {
        kanji: "譲",
        radical: "言（ごんべん）",
        strokeCount: 20
      },
      examples: [
        {
          japanese: "双方が譲歩しなければ合意は難しい。",
          reading: "そうほうがじょうほしなければごういはむずかしい。"
        }
      ],
      microStory: "A pragmatic manager made one small 譲歩."
    });
    expect(feedback.reviewFocus?.extraExamples).toEqual(
      expect.arrayContaining([expect.objectContaining({ japanese: "譲歩案", reading: "じょうほあん" })])
    );
  });
});

describe("recordReview", () => {
  it("records correct answers with a later review interval", () => {
    const memory = recordReview(emptyMemory(), items[0], {
      answer: "けねん",
      correct: true,
      answeredAt: now
    });

    expect(memory.taughtItemIds).toContain("vocab-kenen");
    expect(memory.itemStats["vocab-kenen"].strength).toBe(1);
    expect(memory.itemStats["vocab-kenen"].nextReviewAt).toBe("2026-05-29T00:00:00.000Z");
    expect(memory.reviews).toHaveLength(1);
    expect(memory.mistakes).toHaveLength(0);
  });

  it("keeps missed items weak and logs the mistake for future drills", () => {
    const memory = recordReview(emptyMemory(), items[2], {
      answer: "no need to",
      correct: false,
      answeredAt: now
    });

    expect(memory.itemStats["grammar-yogi"].strength).toBe(0);
    expect(memory.itemStats["grammar-yogi"].incorrectCount).toBe(1);
    expect(memory.mistakes[0]).toMatchObject({
      itemId: "grammar-yogi",
      wrongAnswer: "no need to",
      correction: "to be forced to"
    });
  });
});

describe("getMemorySummary", () => {
  it("summarizes taught, due, and weak items", () => {
    let memory = emptyMemory();
    memory = recordReview(memory, items[0], { answer: "wrong", correct: false, answeredAt: now });
    memory = recordReview(memory, items[1], { answer: "しき", correct: true, answeredAt: now });

    const summary = getMemorySummary(items, memory, now);

    expect(summary.taughtCount).toBe(2);
    expect(summary.weakItems.map((item) => item.id)).toContain("vocab-kenen");
    expect(summary.dueCount).toBe(1);
  });
});

function makeItems(category: StudyItem["category"], count: number): StudyItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${category}-${index}`,
    category,
    level: "N1",
    prompt: `${category} ${index}`,
    reading: "よみ",
    meaning: "meaning",
    acceptedAnswers: ["よみ", "meaning"],
    explanation: "explanation",
    keyboardTip: "keyboard tip",
    examples: [{ japanese: "例文", english: "example" }]
  }));
}
