export type StudyCategory = "vocabulary" | "kanji" | "grammar" | "reading";

export interface StudyExample {
  japanese: string;
  english: string;
}

export interface StudyItem {
  id: string;
  category: StudyCategory;
  level: "N1";
  prompt: string;
  reading: string;
  meaning: string;
  acceptedAnswers: string[];
  explanation: string;
  keyboardTip: string;
  examples: StudyExample[];
}

export interface LearnerProfile {
  displayName: string;
  japaneseLevel: string;
  explanationLanguage: "English";
}

export interface ReviewRecord {
  itemId: string;
  answeredAt: string;
  answer: string;
  correct: boolean;
}

export type KanaScript = "hiragana" | "katakana";

export interface KanaQuizItem {
  id: string;
  script: KanaScript;
  prompt: string;
  target: string;
  acceptedAnswers: string[];
  romaji: string;
  keyboardTip: string;
  explanation: string;
}

export interface KanaFeedback {
  correct: boolean;
  normalizedAnswer: string;
  expected: string;
  explanation: string;
  keyboardTip: string;
}

export interface KanaReviewRecord {
  itemId: string;
  answeredAt: string;
  answer: string;
  correct: boolean;
  expected: string;
}

export interface ItemStat {
  itemId: string;
  strength: number;
  seenCount: number;
  correctCount: number;
  incorrectCount: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
}

export interface MistakeRecord {
  itemId: string;
  wrongAnswer: string;
  correction: string;
  explanation: string;
  keyboardTip: string;
  missedAt: string;
  count: number;
}

export interface LearnerMemory {
  learner: LearnerProfile;
  taughtItemIds: string[];
  reviews: ReviewRecord[];
  itemStats: Record<string, ItemStat>;
  mistakes: MistakeRecord[];
  kanaReviews: KanaReviewRecord[];
  lastSessionAt: string | null;
}

export interface DailySession {
  items: StudyItem[];
  focusNote: string;
  categoryCounts: Record<StudyCategory, number>;
}

export interface AnswerFeedback {
  correct: boolean;
  normalizedAnswer: string;
  expected: string;
  explanation: string;
  keyboardTip: string;
  reviewFocus?: DrillReviewFocus;
}

export interface MemorySummary {
  taughtCount: number;
  dueCount: number;
  weakItems: StudyItem[];
  recentMistakes: MistakeRecord[];
  totalReviews: number;
  accuracy: number;
}

export interface EnglishWordLesson {
  word: string;
  meaning: string;
  simpleExplanation: string;
  banglaMeaning: string;
  sentences: string[];
  synonyms: string[];
  opposite: string;
  speakingChallenge: string;
}

export interface JapaneseSentenceExample {
  japanese: string;
  reading: string;
  english: string;
}

export interface KanjiFocus {
  kanji: string;
  radical: string;
  components: string[];
  strokeCount: number;
  strokeOrderImagePath?: string;
  strokeSteps: string[];
  memoryStory: string;
  sourceLinks: string[];
}

export interface DrillReviewFocus {
  word: string;
  reading: string;
  meaning: string;
  simpleExplanation: string;
  kanjiFocus: KanjiFocus;
  examples: JapaneseSentenceExample[];
  extraExamples: JapaneseSentenceExample[];
  microStory: string;
}

export interface JapaneseWordLesson {
  word: string;
  reading: string;
  romaji?: string;
  meaning: string;
  simpleExplanation: string;
  banglaMeaning: string;
  sentences: JapaneseSentenceExample[];
  extraExamples: JapaneseSentenceExample[];
  synonyms: string[];
  opposite: string;
  speakingChallenge: string;
  kanjiFocus: KanjiFocus;
}

export interface DailyWordPair {
  id: string;
  title: string;
  english: EnglishWordLesson;
  japanese: JapaneseWordLesson;
  microStory: string;
}

export interface ReadingLabPassage {
  id: string;
  title: string;
  theme: string;
  difficulty: "N1";
  estimatedMinutes: number;
  focus: string;
  passage: string[];
  argumentMap: ReadingArgumentPoint[];
  discourseMarkers: ReadingDiscourseMarker[];
  vocabulary: ReadingVocabularyItem[];
  traps: ReadingTrap[];
  questions: ReadingQuestion[];
  paraphrases: ReadingParaphrase[];
  rereadPlan: ReadingRereadStep[];
  summaryChallenge: string;
}

export interface ReadingArgumentPoint {
  label: string;
  content: string;
}

export interface ReadingDiscourseMarker {
  marker: string;
  function: string;
  cue: string;
}

export interface ReadingVocabularyItem {
  expression: string;
  reading: string;
  meaning: string;
  note: string;
}

export interface ReadingTrap {
  label: string;
  trap: string;
  whyItFails: string;
  repair: string;
}

export interface ReadingQuestion {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface ReadingParaphrase {
  original: string;
  paraphrase: string;
  note: string;
}

export interface ReadingRereadStep {
  pass: string;
  minutes: number;
  goal: string;
}
