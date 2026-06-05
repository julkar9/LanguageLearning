import { buildDailySession, recordReview } from "../../src/domain/learningEngine";
import type { LearnerMemory, StudyItem } from "../../src/domain/types";

// Seed data: 50 mock study items
const mockItems: StudyItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: `vocab-${i}`,
  category: "vocabulary",
  prompt: `Word ${i}`,
  meaning: `Meaning ${i}`,
  explanation: `Explanation for Word ${i}`,
  acceptedAnswers: [`answer-${i}`],
  keyboardTip: `Tip ${i}`
}));

// Simple deterministic pseudo-random number generator for reproducibility across evaluations
function createRandom(seed: number) {
  let value = seed;
  return () => {
    const x = Math.sin(value++) * 10000;
    return x - Math.floor(x);
  };
}

function runSimulation(seed: number): { masteredCount: number; totalReviews: number } {
  const rand = createRandom(seed);
  
  let memory: LearnerMemory = {
    learner: {
      displayName: "Simulated Learner",
      japaneseLevel: "N1 candidate",
      explanationLanguage: "English"
    },
    taughtItemIds: [],
    reviews: [],
    itemStats: {},
    mistakes: [],
    kanaReviews: [],
    lastSessionAt: null
  };

  const simulationDays = 60;
  let currentDate = new Date("2026-06-01T00:00:00Z");
  let totalReviews = 0;

  for (let day = 0; day < simulationDays; day++) {
    // Generate daily session (limit to 10 items per day)
    const session = buildDailySession(mockItems, memory, currentDate, { limit: 10 });
    
    for (const item of session.items) {
      const stat = memory.itemStats[item.id];
      const strength = stat ? stat.strength : 0;
      
      // Retention probability: higher strength -> higher chance of correct answer
      const pCorrect = 0.4 + 0.12 * strength;
      const isCorrect = rand() < pCorrect;
      
      memory = recordReview(memory, item, {
        answer: isCorrect ? item.acceptedAnswers[0] : "wrong-answer",
        correct: isCorrect,
        answeredAt: currentDate
      });
      
      totalReviews++;
    }
    
    // Advance date by 1 day
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  // Count items with strength >= 3 (retained / mastered)
  let masteredCount = 0;
  for (const item of mockItems) {
    const stat = memory.itemStats[item.id];
    if (stat && stat.strength >= 3) {
      masteredCount++;
    }
  }

  return { masteredCount, totalReviews };
}

export function evaluate(): number {
  let totalMastered = 0;
  let totalReviews = 0;
  const iterations = 15;

  for (let i = 0; i < iterations; i++) {
    const result = runSimulation(12345 + i);
    totalMastered += result.masteredCount;
    totalReviews += result.totalReviews;
  }

  const avgMastered = totalMastered / iterations;
  const avgReviews = totalReviews / iterations;

  const retentionPercentage = (avgMastered / 50) * 100;
  // Minimize review fatigue: benchmark at 350 reviews.
  const efficiencyScore = Math.max(0, 100 - (avgReviews / 350) * 100);

  // Balanced objective function: 70% retention weight, 30% efficiency weight
  const compositeScore = 0.7 * retentionPercentage + 0.3 * efficiencyScore;

  console.log(`=== Simulation Spaced Repetition Report ===`);
  console.log(`Average Retained Items (Strength >= 3): ${avgMastered.toFixed(2)} / 50 (${retentionPercentage.toFixed(1)}%)`);
  console.log(`Average Total Reviews: ${avgReviews.toFixed(1)}`);
  console.log(`Retention Score: ${retentionPercentage.toFixed(2)}`);
  console.log(`Efficiency Score: ${efficiencyScore.toFixed(2)}`);
  console.log(`-----------------------------------------`);
  console.log(`Composite Evaluation Score: ${compositeScore.toFixed(4)}`);
  
  return compositeScore;
}

if (process.argv[1] === import.meta.filename || process.argv[1]?.endsWith("evaluator.ts")) {
  evaluate();
}
