import { describe, expect, it } from "vitest";
import { selectDailyWordPair } from "./wordPair";
import type { DailyWordPair } from "./types";

const pairs: DailyWordPair[] = [
  {
    id: "discernment-ninshiki",
    title: "Discernment / 認識",
    english: {
      word: "discernment",
      meaning: "the ability to judge clearly and wisely",
      simpleExplanation: "Discernment is careful judgment when details are subtle.",
      banglaMeaning: "বিচক্ষণতা; সূক্ষ্ম বিচারবুদ্ধি",
      sentences: ["Good managers need discernment."],
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
        { japanese: "問題の認識が甘かった。", reading: "もんだいのにんしきがあまかった。", english: "The understanding of the problem was too naive." }
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
  },
  {
    id: "pragmatic-jouho",
    title: "Pragmatic / 譲歩",
    english: {
      word: "pragmatic",
      meaning: "focused on what works in real life",
      simpleExplanation: "A pragmatic person chooses useful action over perfect theory.",
      banglaMeaning: "বাস্তববাদী; কার্যকরমুখী",
      sentences: ["We need a pragmatic plan."],
      synonyms: ["practical", "realistic"],
      opposite: "idealistic",
      speakingChallenge: "Describe a pragmatic compromise."
    },
    japanese: {
      word: "譲歩",
      reading: "じょうほ",
      romaji: "jouho",
      meaning: "concession; compromise",
      simpleExplanation: "譲歩 is giving some ground to move a discussion forward.",
      banglaMeaning: "ছাড়; সমঝোতা",
      sentences: [
        { japanese: "双方が譲歩した。", reading: "そうほうがじょうほした。", english: "Both sides made concessions." }
      ],
      extraExamples: [
        { japanese: "譲歩案", reading: "じょうほあん", english: "compromise proposal" },
        { japanese: "一歩譲歩する", reading: "いっぽじょうほする", english: "make one concession" },
        { japanese: "譲歩を求める", reading: "じょうほをもとめる", english: "ask for a concession" },
        { japanese: "譲歩の余地", reading: "じょうほのよち", english: "room for compromise" },
        { japanese: "大きな譲歩", reading: "おおきなじょうほ", english: "major concession" }
      ],
      synonyms: ["妥協", "歩み寄り"],
      opposite: "強硬",
      speakingChallenge: "Use 譲歩 and pragmatic in one negotiation sentence.",
      kanjiFocus: {
        kanji: "譲",
        radical: "言",
        components: ["言", "㐮"],
        strokeCount: 20,
        strokeSteps: ["Start with 言 on the left.", "Build the top of 㐮.", "Finish the lower sweeping strokes."],
        memoryStory: "Words on the left help someone yield without losing the discussion.",
        sourceLinks: ["https://jitenon.com/kanji/%E8%AD%B2"]
      }
    },
    microStory: "A pragmatic manager used 譲歩 to protect trust."
  }
];

describe("selectDailyWordPair", () => {
  it("selects a deterministic pair for the local calendar day", () => {
    expect(selectDailyWordPair(pairs, new Date("2026-05-28T09:00:00+09:00")).id).toBe(
      selectDailyWordPair(pairs, new Date("2026-05-28T23:30:00+09:00")).id
    );
  });

  it("cycles through available pairs across different days", () => {
    const first = selectDailyWordPair(pairs, new Date("2026-05-28T09:00:00+09:00")).id;
    const second = selectDailyWordPair(pairs, new Date("2026-05-29T09:00:00+09:00")).id;

    expect(first).not.toBe(second);
  });
});

