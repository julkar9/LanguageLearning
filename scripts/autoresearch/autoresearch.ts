import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const enginePath = resolve("src/domain/learningEngine.ts");
const evaluatorPath = resolve("scripts/autoresearch/evaluator.ts");

function getEngineContent(): string {
  return readFileSync(enginePath, "utf8");
}

function writeEngineContent(content: string) {
  writeFileSync(enginePath, content, "utf8");
}

function parseIntervals(content: string): number[] {
  const match = content.match(/const reviewIntervalsByStrength = \[(.*?)\];/);
  if (!match) {
    throw new Error("Could not find reviewIntervalsByStrength in learningEngine.ts");
  }
  return match[1].split(",").map((s) => Number(s.trim()));
}

function updateIntervalsInContent(content: string, newIntervals: number[]): string {
  const arrayStr = `[${newIntervals.join(", ")}]`;
  return content.replace(/const reviewIntervalsByStrength = \[.*?\];/, `const reviewIntervalsByStrength = ${arrayStr};`);
}

function runEvaluator(): number {
  try {
    const output = execSync(`npx tsx ${evaluatorPath}`).toString();
    const match = output.match(/Composite Evaluation Score: ([\d.]+)/);
    if (!match) {
      throw new Error("Could not find Composite Evaluation Score in evaluator output");
    }
    return Number(match[1]);
  } catch (err: any) {
    console.error("Evaluator execution failed:", err.message);
    return 0;
  }
}

async function startAutoResearch() {
  console.log("=========================================");
  console.log("   STARTING KARPATHY AUTORESEARCH LOOP   ");
  console.log("=========================================");

  let originalContent = getEngineContent();
  let currentIntervals = parseIntervals(originalContent);
  let bestScore = runEvaluator();
  let bestIntervals = [...currentIntervals];
  let bestContent = originalContent;

  console.log(`Initial Intervals: [${currentIntervals.join(", ")}]`);
  console.log(`Baseline Composite Score: ${bestScore.toFixed(4)}\n`);

  const maxTrials = 10;
  let improvementsFound = 0;

  for (let trial = 1; trial <= maxTrials; trial++) {
    console.log(`--- Trial ${trial} / ${maxTrials} ---`);
    
    // Propose a mutation (hypothesis)
    // Tweak one of the indices from index 1 to 5.
    const mutatedIntervals = [...bestIntervals];
    const indexToTweak = Math.floor(Math.random() * 5) + 1; // index 1 to 5
    const delta = Math.random() < 0.5 ? -1 : 1;
    mutatedIntervals[indexToTweak] = Math.max(1, mutatedIntervals[indexToTweak] + delta);

    // Enforce non-decreasing order constraint
    for (let i = 1; i < mutatedIntervals.length; i++) {
      if (mutatedIntervals[i] < mutatedIntervals[i - 1]) {
        mutatedIntervals[i] = mutatedIntervals[i - 1];
      }
    }

    console.log(`Proposed Intervals: [${mutatedIntervals.join(", ")}]`);

    // Apply mutation
    const mutatedContent = updateIntervalsInContent(bestContent, mutatedIntervals);
    writeEngineContent(mutatedContent);

    // Evaluate
    const newScore = runEvaluator();
    console.log(`Resulting Composite Score: ${newScore.toFixed(4)}`);

    if (newScore > bestScore + 0.0001) {
      const diff = newScore - bestScore;
      console.log(`🎉 SUCCESS! Score improved by +${diff.toFixed(4)}`);
      bestScore = newScore;
      bestIntervals = mutatedIntervals;
      bestContent = mutatedContent;
      improvementsFound++;
    } else {
      console.log(`❌ DISCARDED (No improvement)`);
      // Revert content to best
      writeEngineContent(bestContent);
    }
    console.log("");
  }

  console.log("=========================================");
  console.log("        AUTORESEARCH COMPLETED           ");
  console.log("=========================================");
  console.log(`Total improvements accepted: ${improvementsFound}`);
  console.log(`Optimal Intervals discovered: [${bestIntervals.join(", ")}]`);
  console.log(`Optimal Score: ${bestScore.toFixed(4)}`);
  
  if (improvementsFound > 0) {
    console.log("\nSaving optimal configuration and updating the local codebase.");
  } else {
    console.log("\nCodebase remained at baseline because no superior configurations were found.");
    writeEngineContent(originalContent);
  }
}

startAutoResearch();
