export { Prisma, PrismaClient } from "@prisma/client";
export type {
  DailyWordPair as DailyWordPairRecord,
  KanaQuizItem as KanaQuizItemRecord,
  LearnerMemory as LearnerMemoryRecord,
  ReadingLabPassage as ReadingLabPassageRecord,
  StudyItem as StudyItemRecord,
  Task as TaskRecord
} from "@prisma/client";
export { createPrismaClient, defaultDatabaseUrl, ensureDatabaseUrl } from "./client";
