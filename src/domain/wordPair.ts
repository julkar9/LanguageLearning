import type { DailyWordPair } from "./types";

export function selectDailyWordPair(pairs: DailyWordPair[], now: Date = new Date()): DailyWordPair {
  if (pairs.length === 0) {
    throw new Error("At least one daily word pair is required.");
  }

  const dayIndex = Math.floor(localDayStart(now).getTime() / 86_400_000);
  return pairs[dayIndex % pairs.length];
}

function localDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
