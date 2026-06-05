import type { KanaFeedback, KanaQuizItem, LearnerMemory } from "./types";

export function evaluateKanaAnswer(item: KanaQuizItem, answer: string): KanaFeedback {
  const normalizedAnswer = normalizeKanaAnswer(answer);
  const correct = item.acceptedAnswers.map(normalizeKanaAnswer).includes(normalizedAnswer);

  return {
    correct,
    normalizedAnswer,
    expected: item.target,
    explanation: item.explanation,
    keyboardTip: item.keyboardTip
  };
}

export function selectKanaQuiz(
  items: KanaQuizItem[],
  memory: LearnerMemory,
  options: { limit?: number } = {}
): KanaQuizItem[] {
  const limit = options.limit ?? 6;
  return [...items]
    .sort((left, right) => kanaPriority(right, memory) - kanaPriority(left, memory))
    .slice(0, limit);
}

export function recordKanaReview(
  memory: LearnerMemory,
  item: KanaQuizItem,
  review: { answer: string; correct: boolean; answeredAt: Date }
): LearnerMemory {
  return {
    ...memory,
    kanaReviews: [
      {
        itemId: item.id,
        answeredAt: review.answeredAt.toISOString(),
        answer: review.answer,
        correct: review.correct,
        expected: item.target
      },
      ...memory.kanaReviews
    ].slice(0, 200),
    lastSessionAt: review.answeredAt.toISOString()
  };
}

function kanaPriority(item: KanaQuizItem, memory: LearnerMemory): number {
  const reviews = memory.kanaReviews.filter((review) => review.itemId === item.id);
  if (reviews.length === 0) {
    return 10;
  }

  const recent = reviews.slice(0, 5);
  const misses = recent.filter((review) => !review.correct).length;
  const hits = recent.filter((review) => review.correct).length;
  return 20 + misses * 4 - hits;
}

function normalizeKanaAnswer(answer: string): string {
  return answer.trim().replace(/\s+/g, "");
}
