import {
  DailyWordPair,
  DailyWordPairSchema,
  KanaQuizItem,
  KanaQuizItemSchema,
  LearnerMemory,
  LearnerMemorySchema,
  ReadingLabPassage,
  ReadingLabPassageSchema,
  SessionResponse,
  StudyItem,
  StudyItemSchema
} from "@language-learning/api-contract";
import type {
  DailyWordPairRecord,
  KanaQuizItemRecord,
  LearnerMemoryRecord,
  ReadingLabPassageRecord,
  StudyItemRecord
} from "@language-learning/database";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  buildDailySession,
  evaluateAnswer,
  evaluateKanaAnswer,
  getMemorySummary,
  recordKanaReview,
  recordReview,
  selectDailyWordPair,
  selectKanaQuiz,
  selectReadingLabPassage
} from "./study-domain";

@Injectable()
export class StudyService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSession(): Promise<SessionResponse> {
    const items = await this.getStudyItems();
    const memory = await this.getMemory();
    const now = new Date();

    return {
      session: buildDailySession(items, memory, now),
      summary: getMemorySummary(items, memory, now),
      memory
    };
  }

  async submitReview(itemId: string, answer: string): Promise<SessionResponse | null> {
    const items = await this.getStudyItems();
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) {
      return null;
    }

    const wordPairs = await this.getWordPairs();
    const feedback = evaluateAnswer(item, answer, wordPairs);
    const memory = recordReview(await this.getMemory(), item, {
      answer,
      correct: feedback.correct,
      answeredAt: new Date()
    });

    await this.saveMemory(memory);

    return {
      feedback,
      memory,
      summary: getMemorySummary(items, memory),
      session: buildDailySession(items, memory)
    };
  }

  async getWordPair(): Promise<DailyWordPair> {
    return selectDailyWordPair(await this.getWordPairs(), new Date());
  }

  async getKanaQuiz() {
    const memory = await this.getMemory();
    return {
      items: selectKanaQuiz(await this.getKanaQuizItems(), memory)
    };
  }

  async submitKanaReview(itemId: string, answer: string) {
    const items = await this.getKanaQuizItems();
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) {
      return null;
    }

    const feedback = evaluateKanaAnswer(item, answer);
    const memory = recordKanaReview(await this.getMemory(), item, {
      answer,
      correct: feedback.correct,
      answeredAt: new Date()
    });
    await this.saveMemory(memory);

    return {
      feedback,
      items: selectKanaQuiz(items, memory)
    };
  }

  async getReadingLab(): Promise<ReadingLabPassage> {
    return selectReadingLabPassage(await this.getReadingLabPassages(), new Date());
  }

  private async getStudyItems(): Promise<StudyItem[]> {
    const records = await this.prisma.studyItem.findMany({
      orderBy: [{ category: "asc" }, { id: "asc" }]
    });
    return records.map(parseStudyItem);
  }

  private async getWordPairs(): Promise<DailyWordPair[]> {
    const records = await this.prisma.dailyWordPair.findMany({
      orderBy: { id: "asc" }
    });
    return records.map(parseDailyWordPair);
  }

  private async getKanaQuizItems(): Promise<KanaQuizItem[]> {
    const records = await this.prisma.kanaQuizItem.findMany({
      orderBy: { id: "asc" }
    });
    return records.map(parseKanaQuizItem);
  }

  private async getReadingLabPassages(): Promise<ReadingLabPassage[]> {
    const records = await this.prisma.readingLabPassage.findMany({
      orderBy: { id: "asc" }
    });
    return records.map(parseReadingLabPassage);
  }

  private async getMemory(): Promise<LearnerMemory> {
    const record = await this.prisma.learnerMemory.findUnique({
      where: { id: "local" }
    });

    if (!record) {
      const memory = createDefaultMemory();
      await this.saveMemory(memory);
      return memory;
    }

    return parseLearnerMemory(record);
  }

  private async saveMemory(memory: LearnerMemory): Promise<void> {
    await this.prisma.learnerMemory.upsert({
      where: { id: "local" },
      update: { payload: memory },
      create: { id: "local", payload: memory }
    });
  }
}

function parseStudyItem(record: StudyItemRecord): StudyItem {
  return StudyItemSchema.parse({
    id: record.id,
    category: record.category,
    level: record.level,
    prompt: record.prompt,
    reading: record.reading,
    meaning: record.meaning,
    acceptedAnswers: record.acceptedAnswers,
    explanation: record.explanation,
    keyboardTip: record.keyboardTip,
    examples: record.examples
  });
}

function parseDailyWordPair(record: DailyWordPairRecord): DailyWordPair {
  return DailyWordPairSchema.parse({
    id: record.id,
    title: record.title,
    english: record.english,
    japanese: record.japanese,
    microStory: record.microStory
  });
}

function parseKanaQuizItem(record: KanaQuizItemRecord): KanaQuizItem {
  return KanaQuizItemSchema.parse({
    id: record.id,
    script: record.script,
    prompt: record.prompt,
    target: record.target,
    acceptedAnswers: record.acceptedAnswers,
    romaji: record.romaji,
    keyboardTip: record.keyboardTip,
    explanation: record.explanation
  });
}

function parseReadingLabPassage(record: ReadingLabPassageRecord): ReadingLabPassage {
  return ReadingLabPassageSchema.parse({
    id: record.id,
    title: record.title,
    theme: record.theme,
    difficulty: record.difficulty,
    estimatedMinutes: record.estimatedMinutes,
    focus: record.focus,
    passage: record.passage,
    argumentMap: record.argumentMap,
    discourseMarkers: record.discourseMarkers,
    vocabulary: record.vocabulary,
    traps: record.traps,
    questions: record.questions,
    paraphrases: record.paraphrases,
    rereadPlan: record.rereadPlan,
    summaryChallenge: record.summaryChallenge
  });
}

function parseLearnerMemory(record: LearnerMemoryRecord): LearnerMemory {
  return LearnerMemorySchema.parse(record.payload);
}

function createDefaultMemory(): LearnerMemory {
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
