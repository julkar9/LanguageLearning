import { describe, expect, it } from "vitest";
import { StudyItemSchema, ReadingLabPassageSchema } from "./study";

describe("study schemas", () => {
  const baseItem = {
    id: "vocab-test",
    category: "vocabulary" as const,
    prompt: "テスト",
    reading: "てすと",
    meaning: "test",
    acceptedAnswers: ["test"],
    explanation: "A simple test item",
    keyboardTip: "Type test",
    examples: [{ japanese: "テストをする", english: "To do a test" }]
  };

  const basePassage = {
    id: "passage-test",
    title: "Test Passage",
    theme: "Testing",
    estimatedMinutes: 5,
    focus: "Test focus",
    passage: ["This is a test passage."],
    argumentMap: [{ label: "Arg", content: "Test content" }],
    discourseMarkers: [{ marker: "Test", function: "test", cue: "test cue" }],
    vocabulary: [{ expression: "test", reading: "test", meaning: "test", note: "test note" }],
    traps: [{ label: "Trap", trap: "test trap", whyItFails: "fails", repair: "repair" }],
    questions: [{ prompt: "Question?", choices: ["A", "B"], answerIndex: 0, explanation: "exp" }],
    paraphrases: [{ original: "orig", paraphrase: "para", note: "note" }],
    rereadPlan: [{ pass: "1", minutes: 1, goal: "goal" }],
    summaryChallenge: "Summarize this test."
  };

  it("accepts N1 level for study items and passages", () => {
    const item = StudyItemSchema.parse({ ...baseItem, level: "N1" });
    expect(item.level).toBe("N1");

    const passage = ReadingLabPassageSchema.parse({ ...basePassage, difficulty: "N1" });
    expect(passage.difficulty).toBe("N1");
  });

  it("accepts other JLPT levels (N2, N3, N4, N5)", () => {
    const levels = ["N2", "N3", "N4", "N5"] as const;
    for (const level of levels) {
      const item = StudyItemSchema.parse({ ...baseItem, level });
      expect(item.level).toBe(level);

      const passage = ReadingLabPassageSchema.parse({ ...basePassage, difficulty: level });
      expect(passage.difficulty).toBe(level);
    }
  });

  it("rejects invalid levels", () => {
    expect(() => StudyItemSchema.parse({ ...baseItem, level: "N6" })).toThrow();
    expect(() => ReadingLabPassageSchema.parse({ ...basePassage, difficulty: "N6" })).toThrow();
  });
});
