import type { ReadingLabPassage } from "./types";

export function selectReadingLabPassage(passages: ReadingLabPassage[], now: Date = new Date()): ReadingLabPassage {
  if (passages.length === 0) {
    throw new Error("At least one reading lab passage is required.");
  }

  const dayIndex = Math.floor(localDayStart(now).getTime() / 86_400_000);
  return passages[dayIndex % passages.length];
}

function localDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
