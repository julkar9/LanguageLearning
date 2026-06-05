import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ErrorSchema } from "./tasks";

const c = initContract();

export const StudyCategorySchema = z.enum(["vocabulary", "kanji", "grammar", "reading"]);

export const StudyExampleSchema = z.object({
  japanese: z.string(),
  english: z.string()
});

export const StudyItemSchema = z.object({
  id: z.string(),
  category: StudyCategorySchema,
  level: z.literal("N1"),
  prompt: z.string(),
  reading: z.string(),
  meaning: z.string(),
  acceptedAnswers: z.array(z.string()),
  explanation: z.string(),
  keyboardTip: z.string(),
  examples: z.array(StudyExampleSchema)
});

export const LearnerProfileSchema = z.object({
  displayName: z.string(),
  japaneseLevel: z.string(),
  explanationLanguage: z.literal("English")
});

export const ReviewRecordSchema = z.object({
  itemId: z.string(),
  answeredAt: z.string(),
  answer: z.string(),
  correct: z.boolean()
});

export const KanaScriptSchema = z.enum(["hiragana", "katakana"]);

export const KanaQuizItemSchema = z.object({
  id: z.string(),
  script: KanaScriptSchema,
  prompt: z.string(),
  target: z.string(),
  acceptedAnswers: z.array(z.string()),
  romaji: z.string(),
  keyboardTip: z.string(),
  explanation: z.string()
});

export const KanaFeedbackSchema = z.object({
  correct: z.boolean(),
  normalizedAnswer: z.string(),
  expected: z.string(),
  explanation: z.string(),
  keyboardTip: z.string()
});

export const KanaReviewRecordSchema = z.object({
  itemId: z.string(),
  answeredAt: z.string(),
  answer: z.string(),
  correct: z.boolean(),
  expected: z.string()
});

export const ItemStatSchema = z.object({
  itemId: z.string(),
  strength: z.number(),
  seenCount: z.number(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  nextReviewAt: z.string(),
  lastReviewedAt: z.string().nullable()
});

export const MistakeRecordSchema = z.object({
  itemId: z.string(),
  wrongAnswer: z.string(),
  correction: z.string(),
  explanation: z.string(),
  keyboardTip: z.string(),
  missedAt: z.string(),
  count: z.number()
});

export const LearnerMemorySchema = z.object({
  learner: LearnerProfileSchema,
  taughtItemIds: z.array(z.string()),
  reviews: z.array(ReviewRecordSchema),
  itemStats: z.record(z.string(), ItemStatSchema),
  mistakes: z.array(MistakeRecordSchema),
  kanaReviews: z.array(KanaReviewRecordSchema).default([]),
  lastSessionAt: z.string().nullable()
});

export const DailySessionSchema = z.object({
  items: z.array(StudyItemSchema),
  focusNote: z.string(),
  categoryCounts: z.record(StudyCategorySchema, z.number())
});

export const KanjiFocusSchema = z.object({
  kanji: z.string(),
  radical: z.string(),
  components: z.array(z.string()),
  strokeCount: z.number(),
  strokeOrderImagePath: z.string().optional(),
  strokeSteps: z.array(z.string()),
  memoryStory: z.string(),
  sourceLinks: z.array(z.string())
});

export const JapaneseSentenceExampleSchema = z.object({
  japanese: z.string(),
  reading: z.string(),
  english: z.string()
});

export const DrillReviewFocusSchema = z.object({
  word: z.string(),
  reading: z.string(),
  meaning: z.string(),
  simpleExplanation: z.string(),
  kanjiFocus: KanjiFocusSchema,
  examples: z.array(JapaneseSentenceExampleSchema),
  extraExamples: z.array(JapaneseSentenceExampleSchema),
  microStory: z.string()
});

export const AnswerFeedbackSchema = z.object({
  correct: z.boolean(),
  normalizedAnswer: z.string(),
  expected: z.string(),
  explanation: z.string(),
  keyboardTip: z.string(),
  reviewFocus: DrillReviewFocusSchema.optional()
});

export const MemorySummarySchema = z.object({
  taughtCount: z.number(),
  dueCount: z.number(),
  weakItems: z.array(StudyItemSchema),
  recentMistakes: z.array(MistakeRecordSchema),
  totalReviews: z.number(),
  accuracy: z.number()
});

export const EnglishWordLessonSchema = z.object({
  word: z.string(),
  meaning: z.string(),
  simpleExplanation: z.string(),
  banglaMeaning: z.string(),
  sentences: z.array(z.string()),
  synonyms: z.array(z.string()),
  opposite: z.string(),
  speakingChallenge: z.string()
});

export const JapaneseWordLessonSchema = z.object({
  word: z.string(),
  reading: z.string(),
  romaji: z.string().optional(),
  meaning: z.string(),
  simpleExplanation: z.string(),
  banglaMeaning: z.string(),
  sentences: z.array(JapaneseSentenceExampleSchema),
  extraExamples: z.array(JapaneseSentenceExampleSchema),
  synonyms: z.array(z.string()),
  opposite: z.string(),
  speakingChallenge: z.string(),
  kanjiFocus: KanjiFocusSchema
});

export const DailyWordPairSchema = z.object({
  id: z.string(),
  title: z.string(),
  english: EnglishWordLessonSchema,
  japanese: JapaneseWordLessonSchema,
  microStory: z.string()
});

export const ReadingArgumentPointSchema = z.object({
  label: z.string(),
  content: z.string()
});

export const ReadingDiscourseMarkerSchema = z.object({
  marker: z.string(),
  function: z.string(),
  cue: z.string()
});

export const ReadingVocabularyItemSchema = z.object({
  expression: z.string(),
  reading: z.string(),
  meaning: z.string(),
  note: z.string()
});

export const ReadingTrapSchema = z.object({
  label: z.string(),
  trap: z.string(),
  whyItFails: z.string(),
  repair: z.string()
});

export const ReadingQuestionSchema = z.object({
  prompt: z.string(),
  choices: z.array(z.string()),
  answerIndex: z.number(),
  explanation: z.string()
});

export const ReadingParaphraseSchema = z.object({
  original: z.string(),
  paraphrase: z.string(),
  note: z.string()
});

export const ReadingRereadStepSchema = z.object({
  pass: z.string(),
  minutes: z.number(),
  goal: z.string()
});

export const ReadingLabPassageSchema = z.object({
  id: z.string(),
  title: z.string(),
  theme: z.string(),
  difficulty: z.literal("N1"),
  estimatedMinutes: z.number(),
  focus: z.string(),
  passage: z.array(z.string()),
  argumentMap: z.array(ReadingArgumentPointSchema),
  discourseMarkers: z.array(ReadingDiscourseMarkerSchema),
  vocabulary: z.array(ReadingVocabularyItemSchema),
  traps: z.array(ReadingTrapSchema),
  questions: z.array(ReadingQuestionSchema),
  paraphrases: z.array(ReadingParaphraseSchema),
  rereadPlan: z.array(ReadingRereadStepSchema),
  summaryChallenge: z.string()
});

export const SessionResponseSchema = z.object({
  session: DailySessionSchema,
  summary: MemorySummarySchema,
  memory: LearnerMemorySchema,
  feedback: AnswerFeedbackSchema.optional()
});

export const WordPairResponseSchema = z.object({
  wordPair: DailyWordPairSchema
});

export const KanaQuizResponseSchema = z.object({
  items: z.array(KanaQuizItemSchema),
  feedback: KanaFeedbackSchema.optional()
});

export const ReadingLabResponseSchema = z.object({
  passage: ReadingLabPassageSchema
});

export const ReviewRequestSchema = z.object({
  itemId: z.string().min(1),
  answer: z.string()
});

export type StudyCategory = z.infer<typeof StudyCategorySchema>;
export type StudyExample = z.infer<typeof StudyExampleSchema>;
export type StudyItem = z.infer<typeof StudyItemSchema>;
export type LearnerMemory = z.infer<typeof LearnerMemorySchema>;
export type DailySession = z.infer<typeof DailySessionSchema>;
export type AnswerFeedback = z.infer<typeof AnswerFeedbackSchema>;
export type MemorySummary = z.infer<typeof MemorySummarySchema>;
export type DailyWordPair = z.infer<typeof DailyWordPairSchema>;
export type KanaQuizItem = z.infer<typeof KanaQuizItemSchema>;
export type KanaFeedback = z.infer<typeof KanaFeedbackSchema>;
export type ReadingLabPassage = z.infer<typeof ReadingLabPassageSchema>;
export type JapaneseSentenceExample = z.infer<typeof JapaneseSentenceExampleSchema>;
export type DrillReviewFocus = z.infer<typeof DrillReviewFocusSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
export type WordPairResponse = z.infer<typeof WordPairResponseSchema>;
export type KanaQuizResponse = z.infer<typeof KanaQuizResponseSchema>;
export type ReadingLabResponse = z.infer<typeof ReadingLabResponseSchema>;
export type ReviewRequest = z.infer<typeof ReviewRequestSchema>;

export const studyContract = c.router({
  getSession: {
    method: "GET",
    path: "/study/session",
    responses: {
      200: SessionResponseSchema,
      500: ErrorSchema
    },
    summary: "Get the current learner session"
  },
  submitReview: {
    method: "POST",
    path: "/study/reviews",
    body: ReviewRequestSchema,
    responses: {
      200: SessionResponseSchema,
      400: ErrorSchema,
      404: ErrorSchema
    },
    summary: "Submit a daily drill answer"
  },
  getWordPair: {
    method: "GET",
    path: "/study/word-pair",
    responses: {
      200: WordPairResponseSchema,
      500: ErrorSchema
    },
    summary: "Get the current daily word pair"
  },
  getKanaQuiz: {
    method: "GET",
    path: "/study/kana-quiz",
    responses: {
      200: KanaQuizResponseSchema,
      500: ErrorSchema
    },
    summary: "Get kana typing quiz items"
  },
  submitKanaReview: {
    method: "POST",
    path: "/study/kana-reviews",
    body: ReviewRequestSchema,
    responses: {
      200: KanaQuizResponseSchema,
      400: ErrorSchema,
      404: ErrorSchema
    },
    summary: "Submit a kana typing answer"
  },
  getReadingLab: {
    method: "GET",
    path: "/study/reading-lab",
    responses: {
      200: ReadingLabResponseSchema,
      500: ErrorSchema
    },
    summary: "Get the current reading lab passage"
  }
});
