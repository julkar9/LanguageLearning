import express from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { evaluateKanaAnswer, recordKanaReview, selectKanaQuiz } from "../src/domain/kanaQuiz";
import { buildDailySession, evaluateAnswer, getMemorySummary, recordReview } from "../src/domain/learningEngine";
import { selectReadingLabPassage } from "../src/domain/readingLab";
import { selectDailyWordPair } from "../src/domain/wordPair";
import type { DailyWordPair, KanaQuizItem, LearnerMemory, ReadingLabPassage, StudyItem } from "../src/domain/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const dataDir = resolve(rootDir, "data");
const seedPath = resolve(dataDir, "seed-items.json");
const memoryPath = resolve(dataDir, "learner-memory.json");
const wordPairsPath = resolve(dataDir, "daily-word-pairs.json");
const kanaQuizPath = resolve(dataDir, "kana-quiz-items.json");
const readingLabPath = resolve(dataDir, "reading-lab-passages.json");
const port = Number(process.env.PORT ?? 5173);
const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use("/artifacts", express.static(resolve(rootDir, "artifacts")));

app.get("/api/session", (_request, response) => {
  const items = loadItems();
  const memory = loadMemory();
  const now = new Date();
  response.json({
    session: buildDailySession(items, memory, now),
    summary: getMemorySummary(items, memory, now),
    memory
  });
});

app.post("/api/reviews", (request, response) => {
  const { itemId, answer } = request.body as { itemId?: string; answer?: string };
  if (!itemId || typeof answer !== "string") {
    response.status(400).json({ error: "itemId and answer are required" });
    return;
  }

  const items = loadItems();
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) {
    response.status(404).json({ error: `Study item not found: ${itemId}` });
    return;
  }

  const feedback = evaluateAnswer(item, answer, loadWordPairs());
  const memory = recordReview(loadMemory(), item, {
    answer,
    correct: feedback.correct,
    answeredAt: new Date()
  });

  saveMemory(memory);

  response.json({
    feedback,
    memory,
    summary: getMemorySummary(items, memory),
    session: buildDailySession(items, memory)
  });
});

app.get("/api/export", (_request, response) => {
  response.download(memoryPath, "learner-memory.json");
});

app.get("/api/word-pair", (_request, response) => {
  response.json({
    wordPair: selectDailyWordPair(loadWordPairs(), new Date())
  });
});

app.get("/api/kana-quiz", (_request, response) => {
  response.json({
    items: selectKanaQuiz(loadKanaQuizItems(), loadMemory())
  });
});

app.get("/api/reading-lab", (_request, response) => {
  response.json({
    passage: selectReadingLabPassage(loadReadingLabPassages(), new Date())
  });
});

app.post("/api/kana-reviews", (request, response) => {
  const { itemId, answer } = request.body as { itemId?: string; answer?: string };
  if (!itemId || typeof answer !== "string") {
    response.status(400).json({ error: "itemId and answer are required" });
    return;
  }

  const items = loadKanaQuizItems();
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) {
    response.status(404).json({ error: `Kana quiz item not found: ${itemId}` });
    return;
  }

  const feedback = evaluateKanaAnswer(item, answer);
  const memory = recordKanaReview(loadMemory(), item, {
    answer,
    correct: feedback.correct,
    answeredAt: new Date()
  });
  saveMemory(memory);

  response.json({
    feedback,
    memory,
    items: selectKanaQuiz(items, memory)
  });
});

if (isProduction) {
  app.use(express.static(resolve(rootDir, "dist")));
} else {
  const vite = await createViteServer({
    root: rootDir,
    server: { middlewareMode: true }
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`N1 Daily Drill running at http://localhost:${port}`);
});

function loadItems(): StudyItem[] {
  return JSON.parse(readFileSync(seedPath, "utf8")) as StudyItem[];
}

function loadWordPairs(): DailyWordPair[] {
  return JSON.parse(readFileSync(wordPairsPath, "utf8")) as DailyWordPair[];
}

function loadKanaQuizItems(): KanaQuizItem[] {
  return JSON.parse(readFileSync(kanaQuizPath, "utf8")) as KanaQuizItem[];
}

function loadReadingLabPassages(): ReadingLabPassage[] {
  return JSON.parse(readFileSync(readingLabPath, "utf8")) as ReadingLabPassage[];
}

function loadMemory(): LearnerMemory {
  ensureMemoryFile();
  const memory = JSON.parse(readFileSync(memoryPath, "utf8")) as LearnerMemory;
  return {
    ...memory,
    kanaReviews: memory.kanaReviews ?? []
  };
}

function saveMemory(memory: LearnerMemory): void {
  ensureMemoryFile();
  writeFileSync(memoryPath, `${JSON.stringify(memory, null, 2)}\n`, "utf8");
}

function ensureMemoryFile(): void {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(memoryPath)) {
    const initialMemory: LearnerMemory = {
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
    writeFileSync(memoryPath, `${JSON.stringify(initialMemory, null, 2)}\n`, "utf8");
  }
}
