CREATE TABLE "Task" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyItem" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "reading" TEXT NOT NULL,
  "meaning" TEXT NOT NULL,
  "acceptedAnswers" JSONB NOT NULL,
  "explanation" TEXT NOT NULL,
  "keyboardTip" TEXT NOT NULL,
  "examples" JSONB NOT NULL,
  CONSTRAINT "StudyItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KanaQuizItem" (
  "id" TEXT NOT NULL,
  "script" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "acceptedAnswers" JSONB NOT NULL,
  "romaji" TEXT NOT NULL,
  "keyboardTip" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  CONSTRAINT "KanaQuizItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyWordPair" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "english" JSONB NOT NULL,
  "japanese" JSONB NOT NULL,
  "microStory" TEXT NOT NULL,
  CONSTRAINT "DailyWordPair_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReadingLabPassage" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "theme" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL,
  "focus" TEXT NOT NULL,
  "passage" JSONB NOT NULL,
  "argumentMap" JSONB NOT NULL,
  "discourseMarkers" JSONB NOT NULL,
  "vocabulary" JSONB NOT NULL,
  "traps" JSONB NOT NULL,
  "questions" JSONB NOT NULL,
  "paraphrases" JSONB NOT NULL,
  "rereadPlan" JSONB NOT NULL,
  "summaryChallenge" TEXT NOT NULL,
  CONSTRAINT "ReadingLabPassage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearnerMemory" (
  "id" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  CONSTRAINT "LearnerMemory_pkey" PRIMARY KEY ("id")
);
