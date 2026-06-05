import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const sessionPayload = {
  session: {
    items: [
      {
        id: "vocab-kenen",
        category: "vocabulary",
        level: "N1",
        prompt: "懸念",
        reading: "けねん",
        meaning: "concern; worry",
        acceptedAnswers: ["けねん", "concern", "worry"],
        explanation: "懸念 is a formal word for a serious concern.",
        keyboardTip: "Type ke-n-e-n for けねん.",
        examples: [{ japanese: "安全性への懸念が高まった。", english: "Concerns about safety increased." }]
      }
    ],
    focusNote: "Today starts with weak review items.",
    categoryCounts: { vocabulary: 1, kanji: 0, grammar: 0, reading: 0 }
  },
  summary: {
    taughtCount: 0,
    dueCount: 0,
    weakItems: [],
    recentMistakes: [],
    totalReviews: 0,
    accuracy: 0
  },
  memory: {
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
  }
};

const wordPairPayload = {
  wordPair: {
    id: "discernment-ninshiki",
    title: "Discernment / 認識",
    english: {
      word: "discernment",
      meaning: "the ability to judge clearly and wisely",
      simpleExplanation: "Discernment is careful judgment when details are subtle.",
      banglaMeaning: "বিচক্ষণতা; সূক্ষ্ম বিচারবুদ্ধি",
      sentences: [
        "Good managers need discernment before changing a team policy.",
        "Her discernment helped us avoid a risky contract.",
        "In public debate, discernment matters more than quick reactions."
      ],
      synonyms: ["judgment", "insight"],
      opposite: "naivety",
      speakingChallenge: "Explain one decision that required discernment."
    },
    japanese: {
      word: "認識",
      reading: "にんしき",
      romaji: "ninshiki",
      meaning: "recognition; understanding; awareness",
      simpleExplanation: "認識 is how you understand or recognize a situation.",
      banglaMeaning: "উপলব্ধি; সচেতন বোঝাপড়া",
      sentences: [
        {
          japanese: "問題の認識が甘かった。",
          reading: "もんだいのにんしきがあまかった。",
          english: "The understanding of the problem was too naive."
        }
      ],
      extraExamples: [
        { japanese: "共通認識", reading: "きょうつうにんしき", english: "shared understanding" },
        { japanese: "認識不足", reading: "にんしきぶそく", english: "lack of awareness" },
        { japanese: "現状認識", reading: "げんじょうにんしき", english: "understanding of the current situation" },
        { japanese: "認識を改める", reading: "にんしきをあらためる", english: "revise one's understanding" },
        { japanese: "危機認識", reading: "ききにんしき", english: "sense of crisis" }
      ],
      synonyms: ["理解", "把握"],
      opposite: "誤解",
      speakingChallenge: "Use 認識 and discernment in one short opinion.",
      kanjiFocus: {
        kanji: "識",
        radical: "言",
        components: ["言", "音", "戈"],
        strokeCount: 19,
        strokeOrderImagePath: "/artifacts/shiki_stroke_sheet.png",
        strokeSteps: ["Write 言 first.", "Build 音.", "Finish 戈."],
        memoryStory: "Words plus sound become sharp enough to recognize.",
        sourceLinks: ["https://jitenon.com/kanji/%E8%AD%98"]
      }
    },
    microStory: "A leader needs discernment before changing the team's 認識."
  }
};

const kanaQuizPayload = {
  items: [
    {
      id: "hiragana-kya",
      script: "hiragana",
      prompt: "Type kya in hiragana.",
      target: "きゃ",
      acceptedAnswers: ["きゃ"],
      romaji: "kya",
      keyboardTip: "Type k-y-a to produce きゃ.",
      explanation: "き + small ゃ becomes kya."
    }
  ]
};

const readingLabPayload = {
  passage: {
    id: "policy-transparency",
    title: "制度の透明性と説明責任",
    theme: "Policy critique",
    difficulty: "N1",
    estimatedMinutes: 14,
    focus: "Track contrast, concession, and the author's final judgment.",
    passage: [
      "新しい制度が導入されるたびに、利用者には少なからぬ負担が生じる。",
      "とはいえ、負担そのものが問題なのではない。目的と判断基準が見えないまま協力を求められることが、不信感を生むのである。"
    ],
    argumentMap: [
      { label: "Problem", content: "Users resist rules when the reason is invisible." },
      { label: "Conclusion", content: "Transparency must be designed before enforcement." }
    ],
    discourseMarkers: [
      { marker: "とはいえ", function: "concession", cue: "Limits the previous claim before the real argument." }
    ],
    vocabulary: [
      { expression: "説明責任", reading: "せつめいせきにん", meaning: "accountability", note: "Common in policy and business critique." }
    ],
    traps: [
      {
        label: "Too extreme",
        trap: "The author rejects all new systems.",
        whyItFails: "The passage criticizes unexplained systems, not systems themselves.",
        repair: "Keep the contrast between burden and unclear purpose."
      }
    ],
    questions: [
      {
        prompt: "筆者の主張に最も近いものはどれか。",
        choices: ["制度の導入は避けるべきだ。", "説明がない負担は不信感を生む。", "利用者は常に便利さを優先する。"],
        answerIndex: 1,
        explanation: "The author says unexplained burden creates distrust."
      }
    ],
    paraphrases: [
      {
        original: "目的と判断基準が見えないまま協力を求められる。",
        paraphrase: "理由が共有されなければ、協力は納得につながらない。",
        note: "The paraphrase keeps the logic while replacing concrete nouns."
      }
    ],
    rereadPlan: [
      { pass: "First pass", minutes: 4, goal: "Mark contrast and concession signals." },
      { pass: "Second pass", minutes: 5, goal: "Match each paragraph to the argument map." }
    ],
    summaryChallenge: "Use one Japanese sentence to explain why transparency matters."
  }
};

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens on the Daily Drill cockpit tab without the export memory action", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const endpoint = url.toString();
      if (endpoint === "/api/session") {
        return Promise.resolve({ ok: true, json: async () => sessionPayload });
      }
      if (endpoint === "/api/word-pair") {
        return Promise.resolve({ ok: true, json: async () => wordPairPayload });
      }
      if (endpoint === "/api/kana-quiz") {
        return Promise.resolve({ ok: true, json: async () => kanaQuizPayload });
      }
      if (endpoint === "/api/reading-lab") {
        return Promise.resolve({ ok: true, json: async () => readingLabPayload });
      }
      if (endpoint === "/api/reviews") {
        return Promise.resolve({
        ok: true,
        json: async () => ({
          ...sessionPayload,
          feedback: {
            correct: true,
            normalizedAnswer: "けねん",
            expected: "けねん, concern, worry",
            explanation: "懸念 is a formal word for a serious concern.",
            keyboardTip: "Type ke-n-e-n for けねん."
          },
          summary: { ...sessionPayload.summary, taughtCount: 1, totalReviews: 1, accuracy: 100 }
        })
      });
      }
      throw new Error(`Unexpected fetch: ${endpoint}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(await screen.findByRole("heading", { name: /daily drill/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /daily drill/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("link", { name: /export memory/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /export memory/i })).not.toBeInTheDocument();
    expect(screen.getByText("懸念")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/your answer/i), "けねん");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
      expect(screen.getByText(/type ke-n-e-n/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /refresh drill/i })).toHaveFocus();
    expect(fetchMock).toHaveBeenCalledWith("/api/reviews", expect.objectContaining({ method: "POST" }));
  });

  it("shows rich kanji review guidance after a missed daily drill answer", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const endpoint = url.toString();
      if (endpoint === "/api/session") {
        return Promise.resolve({ ok: true, json: async () => sessionPayload });
      }
      if (endpoint === "/api/word-pair") {
        return Promise.resolve({ ok: true, json: async () => wordPairPayload });
      }
      if (endpoint === "/api/kana-quiz") {
        return Promise.resolve({ ok: true, json: async () => kanaQuizPayload });
      }
      if (endpoint === "/api/reading-lab") {
        return Promise.resolve({ ok: true, json: async () => readingLabPayload });
      }
      if (endpoint === "/api/reviews") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...sessionPayload,
            feedback: {
              correct: false,
              normalizedAnswer: "shiko",
              expected: "けねん, concern, worry",
              explanation: "懸念 is a formal word for a serious concern.",
              keyboardTip: "Type ke-n-e-n for けねん.",
              reviewFocus: {
                word: "懸念",
                reading: "けねん",
                meaning: "concern; worry",
                simpleExplanation: "懸念 is a formal concern about a risk that may happen.",
                kanjiFocus: {
                  kanji: "懸",
                  radical: "心",
                  components: ["県", "系", "心"],
                  strokeCount: 20,
                  strokeOrderImagePath: "/artifacts/ken_stroke_order.svg",
                  strokeSteps: ["Build the upper suspended shape.", "Finish with 心 at the bottom."],
                  memoryStory: "A concern hangs above the heart, so 懸 keeps 心 underneath something suspended.",
                  sourceLinks: ["https://jitenon.com/kanji/%E6%87%B8"]
                },
                examples: [
                  {
                    japanese: "安全性への懸念が高まった。",
                    reading: "あんぜんせいへのけねんがたかまった。",
                    english: "Concerns about safety increased."
                  }
                ],
                extraExamples: [
                  { japanese: "懸念を示す", reading: "けねんをしめす", english: "express concern" },
                  { japanese: "懸念材料", reading: "けねんざいりょう", english: "cause for concern" }
                ],
                microStory: "Before signing, the manager named one 懸念 so the team could reduce the risk."
              }
            },
            summary: { ...sessionPayload.summary, taughtCount: 1, totalReviews: 1, accuracy: 0 }
          })
        });
      }
      throw new Error(`Unexpected fetch: ${endpoint}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await userEvent.type(await screen.findByLabelText(/your answer/i), "shiko");
    await userEvent.keyboard("{Enter}");

    expect(await screen.findByText(/needs review/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /懸 · 20 strokes/i })).toBeInTheDocument();
    expect(screen.getByText(/Radical: 心/)).toBeInTheDocument();
    expect(screen.getByText(/Build the upper suspended shape/)).toBeInTheDocument();
    expect(screen.getByText(/A concern hangs above the heart/)).toBeInTheDocument();
    expect(screen.getByText("あんぜんせいへのけねんがたかまった。")).toBeInTheDocument();
    expect(screen.getByText("懸念材料")).toBeInTheDocument();
    expect(screen.getByText(/Before signing/)).toBeInTheDocument();
  });

  it("switches to the N1 reading lab with argument, trap, and reread training", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const endpoint = url.toString();
      if (endpoint === "/api/session") {
        return Promise.resolve({ ok: true, json: async () => sessionPayload });
      }
      if (endpoint === "/api/word-pair") {
        return Promise.resolve({ ok: true, json: async () => wordPairPayload });
      }
      if (endpoint === "/api/kana-quiz") {
        return Promise.resolve({ ok: true, json: async () => kanaQuizPayload });
      }
      if (endpoint === "/api/reading-lab") {
        return Promise.resolve({ ok: true, json: async () => readingLabPayload });
      }
      throw new Error(`Unexpected fetch: ${endpoint}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await userEvent.click(await screen.findByRole("tab", { name: /reading lab/i }));

    expect(await screen.findByRole("heading", { name: /n1 reading lab/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /制度の透明性と説明責任/i })).toBeInTheDocument();
    expect(screen.getByText(/新しい制度が導入されるたびに/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /argument map/i })).toBeInTheDocument();
    expect(screen.getByText(/Transparency must be designed before enforcement/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /trap analysis/i })).toBeInTheDocument();
    expect(screen.getByText(/The author rejects all new systems/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /paraphrase recognition/i })).toBeInTheDocument();
    expect(screen.getByText(/理由が共有されなければ/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /reread cycle/i })).toBeInTheDocument();
    expect(screen.getByText(/Second pass · 5 min/i)).toBeInTheDocument();
    expect(screen.queryByText(/Correct: 2/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /reveal reading answer/i }));

    expect(screen.getByText(/Correct: 2/)).toBeInTheDocument();
    expect(screen.getByText(/unexplained burden creates distrust/i)).toBeInTheDocument();
  });

  it("switches to the daily word pair cockpit tab and its lesson sub-tabs", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const endpoint = url.toString();
      if (endpoint === "/api/session") {
        return Promise.resolve({ ok: true, json: async () => sessionPayload });
      }
      if (endpoint === "/api/word-pair") {
        return Promise.resolve({ ok: true, json: async () => wordPairPayload });
      }
      if (endpoint === "/api/kana-quiz") {
        return Promise.resolve({ ok: true, json: async () => kanaQuizPayload });
      }
      if (endpoint === "/api/reading-lab") {
        return Promise.resolve({ ok: true, json: async () => readingLabPayload });
      }
      throw new Error(`Unexpected fetch: ${endpoint}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    const wordPairTab = await screen.findByRole("tab", { name: /word pair/i });
    wordPairTab.focus();
    await userEvent.keyboard("{Enter}");

    expect(await screen.findByRole("heading", { name: /daily word pair/i })).toBeInTheDocument();
    expect(screen.getByText("discernment")).toBeInTheDocument();
    expect(screen.getByText("বিচক্ষণতা; সূক্ষ্ম বিচারবুদ্ধি")).toBeInTheDocument();

    screen.getByRole("tab", { name: /japanese/i }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("認識")).toBeInTheDocument();
    expect(screen.getByText("もんだいのにんしきがあまかった。")).toBeInTheDocument();

    screen.getByRole("tab", { name: /kanji/i }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("img", { name: /stroke order for 識/i })).toHaveAttribute(
      "src",
      "/artifacts/shiki_stroke_sheet.png"
    );

    screen.getByRole("tab", { name: /examples/i }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText(/Use 認識 and discernment/i)).toBeInTheDocument();
  });

  it("activates cockpit tabs after an intentional mouse dwell and cancels casual hover", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const endpoint = url.toString();
      if (endpoint === "/api/session") {
        return Promise.resolve({ ok: true, json: async () => sessionPayload });
      }
      if (endpoint === "/api/word-pair") {
        return Promise.resolve({ ok: true, json: async () => wordPairPayload });
      }
      if (endpoint === "/api/kana-quiz") {
        return Promise.resolve({ ok: true, json: async () => kanaQuizPayload });
      }
      if (endpoint === "/api/reading-lab") {
        return Promise.resolve({ ok: true, json: async () => readingLabPayload });
      }
      throw new Error(`Unexpected fetch: ${endpoint}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    const wordPairTab = await screen.findByRole("tab", { name: /word pair/i });
    const kanaTab = screen.getByRole("tab", { name: /kana/i });

    vi.useFakeTimers();
    fireEvent.mouseEnter(kanaTab);
    await act(async () => {
      vi.advanceTimersByTime(450);
    });
    fireEvent.mouseLeave(kanaTab);
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("tab", { name: /daily drill/i })).toHaveAttribute("aria-selected", "true");

    fireEvent.mouseEnter(wordPairTab);
    await act(async () => {
      vi.advanceTimersByTime(899);
    });
    expect(screen.queryByRole("heading", { name: /daily word pair/i })).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByRole("heading", { name: /daily word pair/i })).toBeInTheDocument();
    expect(wordPairTab).toHaveAttribute("aria-selected", "true");
  });

  it("keeps kana typing quiz practice with correction feedback", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const endpoint = url.toString();
      if (endpoint === "/api/session") {
        return Promise.resolve({ ok: true, json: async () => sessionPayload });
      }
      if (endpoint === "/api/word-pair") {
        return Promise.resolve({ ok: true, json: async () => wordPairPayload });
      }
      if (endpoint === "/api/kana-quiz") {
        return Promise.resolve({ ok: true, json: async () => kanaQuizPayload });
      }
      if (endpoint === "/api/reading-lab") {
        return Promise.resolve({ ok: true, json: async () => readingLabPayload });
      }
      if (endpoint === "/api/kana-reviews") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            items: kanaQuizPayload.items,
            feedback: {
              correct: false,
              normalizedAnswer: "kya",
              expected: "きゃ",
              explanation: "き + small ゃ becomes kya.",
              keyboardTip: "Type k-y-a to produce きゃ."
            }
          })
        });
      }
      throw new Error(`Unexpected fetch: ${endpoint}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await userEvent.click(await screen.findByRole("tab", { name: /kana/i }));

    expect(await screen.findByRole("heading", { name: /kana typing quiz/i })).toBeInTheDocument();
    expect(screen.getByText("Type kya in hiragana.")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/kana answer/i), "kya");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText(/needs kana review/i)).toBeInTheDocument();
      expect(screen.getAllByText(/type k-y-a/i).length).toBeGreaterThan(0);
    });
    expect(screen.getByRole("button", { name: /next kana/i })).toHaveFocus();
    expect(fetchMock).toHaveBeenCalledWith("/api/kana-reviews", expect.objectContaining({ method: "POST" }));
  });

  it("switches to the memory cockpit tab with summary stats", async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const endpoint = url.toString();
      if (endpoint === "/api/session") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...sessionPayload,
            summary: {
              taughtCount: 7,
              dueCount: 6,
              weakItems: [sessionPayload.session.items[0]],
              recentMistakes: [
                {
                  itemId: "vocab-kenen",
                  wrongAnswer: "kinen",
                  correction: "concern; worry",
                  explanation: "懸念 is formal concern.",
                  keyboardTip: "Type ke-n-e-n.",
                  missedAt: "2026-06-04T08:20:24.883Z",
                  count: 3
                }
              ],
              totalReviews: 25,
              accuracy: 20
            }
          })
        });
      }
      if (endpoint === "/api/word-pair") {
        return Promise.resolve({ ok: true, json: async () => wordPairPayload });
      }
      if (endpoint === "/api/kana-quiz") {
        return Promise.resolve({ ok: true, json: async () => kanaQuizPayload });
      }
      if (endpoint === "/api/reading-lab") {
        return Promise.resolve({ ok: true, json: async () => readingLabPayload });
      }
      throw new Error(`Unexpected fetch: ${endpoint}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    await userEvent.click(await screen.findByRole("tab", { name: /memory/i }));

    expect(await screen.findByRole("heading", { name: /memory/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Weak points" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent mistakes" })).toBeInTheDocument();
    expect(screen.getAllByText("20%").length).toBeGreaterThan(0);
  });
});
