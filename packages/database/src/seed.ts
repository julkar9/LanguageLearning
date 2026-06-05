import {
  DailyWordPairSchema,
  KanaQuizItemSchema,
  LearnerMemorySchema,
  ReadingLabPassageSchema,
  StudyItemSchema,
  z
} from "@language-learning/api-contract";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPrismaClient } from "./client";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const dataDir = resolve(repoRoot, "data");

const prisma = createPrismaClient();

async function readJson(fileName: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(dataDir, fileName), "utf8"));
}

async function main(): Promise<void> {
  const studyItems = z.array(StudyItemSchema).parse(await readJson("seed-items.json"));
  const wordPairs = z.array(DailyWordPairSchema).parse(await readJson("daily-word-pairs.json"));
  const kanaItems = z.array(KanaQuizItemSchema).parse(await readJson("kana-quiz-items.json"));
  const readingPassages = z.array(ReadingLabPassageSchema).parse(await readJson("reading-lab-passages.json"));
  const learnerMemory = LearnerMemorySchema.parse(await readJson("learner-memory.json"));

  await prisma.task.deleteMany();
  await prisma.studyItem.deleteMany();
  await prisma.dailyWordPair.deleteMany();
  await prisma.kanaQuizItem.deleteMany();
  await prisma.readingLabPassage.deleteMany();

  await prisma.task.createMany({
    data: [
      { title: "Read the shared API contract", done: true },
      { title: "Create a task from the Next.js page", done: false },
      { title: "Toggle a task through the NestJS API", done: false }
    ]
  });

  await prisma.studyItem.createMany({
    data: studyItems.map((item) => ({
      id: item.id,
      category: item.category,
      level: item.level,
      prompt: item.prompt,
      reading: item.reading,
      meaning: item.meaning,
      acceptedAnswers: item.acceptedAnswers,
      explanation: item.explanation,
      keyboardTip: item.keyboardTip,
      examples: item.examples
    }))
  });

  await prisma.dailyWordPair.createMany({
    data: wordPairs.map((pair) => ({
      id: pair.id,
      title: pair.title,
      english: pair.english,
      japanese: pair.japanese,
      microStory: pair.microStory
    }))
  });

  await prisma.kanaQuizItem.createMany({
    data: kanaItems.map((item) => ({
      id: item.id,
      script: item.script,
      prompt: item.prompt,
      target: item.target,
      acceptedAnswers: item.acceptedAnswers,
      romaji: item.romaji,
      keyboardTip: item.keyboardTip,
      explanation: item.explanation
    }))
  });

  await prisma.readingLabPassage.createMany({
    data: readingPassages.map((passage) => ({
      id: passage.id,
      title: passage.title,
      theme: passage.theme,
      difficulty: passage.difficulty,
      estimatedMinutes: passage.estimatedMinutes,
      focus: passage.focus,
      passage: passage.passage,
      argumentMap: passage.argumentMap,
      discourseMarkers: passage.discourseMarkers,
      vocabulary: passage.vocabulary,
      traps: passage.traps,
      questions: passage.questions,
      paraphrases: passage.paraphrases,
      rereadPlan: passage.rereadPlan,
      summaryChallenge: passage.summaryChallenge
    }))
  });

  await prisma.learnerMemory.upsert({
    where: { id: "local" },
    update: { payload: learnerMemory },
    create: { id: "local", payload: learnerMemory }
  });

  console.log(
    `Seeded ${studyItems.length} study items, ${wordPairs.length} word pairs, ${kanaItems.length} kana cards, ${readingPassages.length} reading passages, and 3 tasks.`
  );
}

await main().finally(async () => {
  await prisma.$disconnect();
});
