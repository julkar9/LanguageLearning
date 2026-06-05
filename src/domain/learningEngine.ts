import type {
  AnswerFeedback,
  DailySession,
  DailyWordPair,
  DrillReviewFocus,
  ItemStat,
  LearnerMemory,
  MemorySummary,
  StudyCategory,
  StudyItem
} from "./types";

const categoryOrder: StudyCategory[] = ["vocabulary", "kanji", "reading", "grammar"];
const reviewIntervalsByStrength = [0, 1, 3, 8, 14, 30];

export function buildDailySession(
  items: StudyItem[],
  memory: LearnerMemory,
  now: Date = new Date(),
  options: { limit?: number } = {}
): DailySession {
  const limit = options.limit ?? 14;
  const selected: StudyItem[] = [];
  const byCategory = new Map<StudyCategory, StudyItem[]>();

  for (const category of categoryOrder) {
    byCategory.set(
      category,
      items
        .filter((item) => item.category === category)
        .sort((left, right) => itemPriority(left, memory, now) - itemPriority(right, memory, now))
    );
  }

  while (selected.length < limit) {
    let addedInRound = false;

    for (const category of categoryOrder) {
      const candidate = byCategory.get(category)?.shift();
      if (!candidate) {
        continue;
      }

      selected.push(candidate);
      addedInRound = true;

      if (selected.length >= limit) {
        break;
      }
    }

    if (!addedInRound) {
      break;
    }
  }

  selected.sort((left, right) => itemPriority(left, memory, now) - itemPriority(right, memory, now));

  return {
    items: selected.slice(0, limit),
    focusNote: buildFocusNote(selected, memory, now),
    categoryCounts: countCategories(selected.slice(0, limit))
  };
}

export function evaluateAnswer(item: StudyItem, answer: string, wordPairs: DailyWordPair[] = []): AnswerFeedback {
  const normalizedAnswer = normalizeAnswer(answer);
  const acceptedAnswers = item.acceptedAnswers.map(normalizeAnswer);
  const correct = acceptedAnswers.includes(normalizedAnswer);
  const reviewFocus = correct ? undefined : buildReviewFocus(item, wordPairs);

  return {
    correct,
    normalizedAnswer,
    expected: item.acceptedAnswers.join(", "),
    explanation: item.explanation,
    keyboardTip: item.keyboardTip,
    ...(reviewFocus ? { reviewFocus } : {})
  };
}

export function buildReviewFocus(item: StudyItem, wordPairs: DailyWordPair[]): DrillReviewFocus | undefined {
  const pair = wordPairs.find((candidate) => matchesReviewPair(item, candidate));
  if (!pair) {
    return undefined;
  }

  return {
    word: pair.japanese.word,
    reading: pair.japanese.reading,
    meaning: pair.japanese.meaning,
    simpleExplanation: pair.japanese.simpleExplanation,
    kanjiFocus: pair.japanese.kanjiFocus,
    examples: pair.japanese.sentences,
    extraExamples: pair.japanese.extraExamples,
    microStory: pair.microStory
  };
}

export function recordReview(
  memory: LearnerMemory,
  item: StudyItem,
  review: { answer: string; correct: boolean; answeredAt: Date }
): LearnerMemory {
  const answeredAt = review.answeredAt.toISOString();
  const existing = memory.itemStats[item.id] ?? createEmptyStat(item.id);
  const strength = review.correct ? Math.min(existing.strength + 1, 5) : Math.max(existing.strength - 1, 0);
  const nextReviewAt = review.correct
    ? addDays(review.answeredAt, reviewIntervalsByStrength[strength]).toISOString()
    : review.answeredAt.toISOString();

  const updatedStat: ItemStat = {
    itemId: item.id,
    strength,
    seenCount: existing.seenCount + 1,
    correctCount: existing.correctCount + (review.correct ? 1 : 0),
    incorrectCount: existing.incorrectCount + (review.correct ? 0 : 1),
    nextReviewAt,
    lastReviewedAt: answeredAt
  };

  const mistakes = review.correct
    ? memory.mistakes
    : upsertMistake(memory.mistakes, item, review.answer, answeredAt);

  return {
    ...memory,
    taughtItemIds: Array.from(new Set([...memory.taughtItemIds, item.id])),
    reviews: [
      ...memory.reviews,
      {
        itemId: item.id,
        answeredAt,
        answer: review.answer,
        correct: review.correct
      }
    ].slice(-500),
    itemStats: {
      ...memory.itemStats,
      [item.id]: updatedStat
    },
    mistakes: mistakes.slice(0, 50),
    lastSessionAt: answeredAt
  };
}

export function getMemorySummary(items: StudyItem[], memory: LearnerMemory, now: Date = new Date()): MemorySummary {
  const weakItems = items.filter((item) => {
    const stat = memory.itemStats[item.id];
    return stat ? stat.strength <= 1 && stat.incorrectCount > 0 : false;
  });
  const dueCount = items.filter((item) => isDue(item, memory, now)).length;
  const correctReviews = memory.reviews.filter((review) => review.correct).length;
  const accuracy = memory.reviews.length === 0 ? 0 : Math.round((correctReviews / memory.reviews.length) * 100);

  return {
    taughtCount: memory.taughtItemIds.length,
    dueCount,
    weakItems,
    recentMistakes: memory.mistakes.slice(0, 8),
    totalReviews: memory.reviews.length,
    accuracy
  };
}

function itemPriority(item: StudyItem, memory: LearnerMemory, now: Date): number {
  const categoryWeight = categoryOrder.indexOf(item.category) / 10;
  const stat = memory.itemStats[item.id];
  if (!stat) {
    return 20 + categoryWeight;
  }
  const duePenalty = isDue(item, memory, now) ? 0 : 30;
  return duePenalty + stat.strength + categoryWeight;
}

function isDue(item: StudyItem, memory: LearnerMemory, now: Date): boolean {
  const stat = memory.itemStats[item.id];
  if (!stat) {
    return false;
  }
  return new Date(stat.nextReviewAt).getTime() <= now.getTime();
}

function buildFocusNote(items: StudyItem[], memory: LearnerMemory, now: Date): string {
  const weakCount = items.filter((item) => {
    const stat = memory.itemStats[item.id];
    return stat && stat.strength <= 1 && isDue(item, memory, now);
  }).length;

  if (weakCount > 0) {
    return `Today starts with ${weakCount} weak review item${weakCount === 1 ? "" : "s"}, then introduces balanced N1 practice.`;
  }

  return "Today introduces a balanced N1 mix across vocabulary, kanji, reading, and grammar.";
}

function countCategories(items: StudyItem[]): Record<StudyCategory, number> {
  return items.reduce(
    (counts, item) => {
      counts[item.category] += 1;
      return counts;
    },
    { vocabulary: 0, kanji: 0, grammar: 0, reading: 0 }
  );
}

function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/[。、,.!?！？]/g, "")
    .replace(/\s+/g, " ");
}

function matchesReviewPair(item: StudyItem, pair: DailyWordPair): boolean {
  const prompt = item.prompt.trim();
  const word = pair.japanese.word.trim();
  const focusKanji = pair.japanese.kanjiFocus.kanji.trim();

  return prompt === word || prompt.includes(word) || prompt === focusKanji || prompt.includes(focusKanji);
}

function createEmptyStat(itemId: string): ItemStat {
  return {
    itemId,
    strength: 0,
    seenCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    nextReviewAt: new Date(0).toISOString(),
    lastReviewedAt: null
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function upsertMistake(
  mistakes: LearnerMemory["mistakes"],
  item: StudyItem,
  wrongAnswer: string,
  missedAt: string
): LearnerMemory["mistakes"] {
  const existing = mistakes.find((mistake) => mistake.itemId === item.id);
  const updated = {
    itemId: item.id,
    wrongAnswer,
    correction: item.meaning,
    explanation: item.explanation,
    keyboardTip: item.keyboardTip,
    missedAt,
    count: (existing?.count ?? 0) + 1
  };

  return [updated, ...mistakes.filter((mistake) => mistake.itemId !== item.id)];
}
