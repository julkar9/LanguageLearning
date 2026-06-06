import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudyCockpit } from "./study-cockpit";

const firstItem = {
  id: "study-1",
  category: "vocabulary",
  level: "N1",
  prompt: "甚だしい",
  reading: "はなはだしい",
  meaning: "severe",
  acceptedAnswers: ["severe", "はなはだしい"],
  explanation: "Used for an extreme degree.",
  keyboardTip: "Enter an English meaning or reading.",
  examples: [{ japanese: "被害は甚だしい。", english: "The damage is severe." }]
} as const;

const secondItem = {
  ...firstItem,
  id: "study-2",
  prompt: "施行",
  reading: "しこう",
  meaning: "enactment",
  acceptedAnswers: ["enactment", "しこう"]
} as const;

describe("StudyCockpit interactions", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(mockStudyFetch));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens a tab after a deliberate hover dwell, but not after a short pass", async () => {
    renderWithQueryClient(<StudyCockpit />);

    const readingTab = await screen.findByRole("tab", { name: /reading lab/i });
    fireEvent.pointerOver(readingTab, { clientX: 20, clientY: 20, pointerType: "mouse" });
    await wait(500);
    expect(readingTab).toHaveAttribute("aria-selected", "false");

    fireEvent.pointerOut(readingTab, { clientX: 200, clientY: 20, pointerType: "mouse" });
    await wait(450);
    expect(readingTab).toHaveAttribute("aria-selected", "false");

    fireEvent.pointerOver(readingTab, { clientX: 20, clientY: 20, pointerType: "mouse" });
    await wait(900);

    await waitFor(() => {
      expect(readingTab).toHaveAttribute("aria-selected", "true");
    });
  });

  it("lets Enter submit the answer, then Enter advances to the next drill item", async () => {
    renderWithQueryClient(<StudyCockpit />);

    const input = await screen.findByLabelText("Your answer");
    await userEvent.type(input, "severe");
    await userEvent.keyboard("{Enter}");

    expect(await screen.findByText("Correct")).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");

    expect(await screen.findByText("施行")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Your answer")).toHaveFocus();
    });
  });
});

function renderWithQueryClient(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

function mockStudyFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = requestUrl(input);
  const method = init?.method ?? "GET";

  if (url.endsWith("/study/session") && method === "GET") {
    return Promise.resolve(jsonResponse(sessionBody()));
  }

  if (url.endsWith("/study/reviews") && method === "POST") {
    return Promise.resolve(
      jsonResponse({
        ...sessionBody(),
        feedback: {
          correct: true,
          normalizedAnswer: "severe",
          expected: "severe, はなはだしい",
          explanation: "Used for an extreme degree.",
          keyboardTip: "Enter advances after feedback."
        }
      })
    );
  }

  if (url.endsWith("/study/word-pair") && method === "GET") {
    return Promise.resolve(jsonResponse({ wordPair: wordPairBody() }));
  }

  if (url.endsWith("/study/kana-quiz") && method === "GET") {
    return Promise.resolve(jsonResponse({ items: [] }));
  }

  if (url.endsWith("/study/reading-lab") && method === "GET") {
    return Promise.resolve(jsonResponse({ passage: readingLabBody() }));
  }

  return Promise.resolve(jsonResponse({ message: `Unexpected request: ${method} ${url}` }, 500));
}

function sessionBody() {
  return {
    session: {
      items: [firstItem, secondItem],
      focusNote: "Two focused items for keyboard practice.",
      categoryCounts: {
        vocabulary: 2,
        kanji: 0,
        grammar: 0,
        reading: 0
      }
    },
    summary: {
      taughtCount: 0,
      dueCount: 2,
      weakItems: [],
      recentMistakes: [],
      totalReviews: 0,
      accuracy: 0
    },
    memory: {
      learner: {
        displayName: "Test learner",
        japaneseLevel: "N1",
        explanationLanguage: "English"
      },
      taughtItemIds: [],
      reviews: [],
      itemStats: {},
      mistakes: [],
      kanaReviews: [],
      lastSessionAt: null
    }
  };
}

function wordPairBody() {
  return {
    id: "word-1",
    title: "Discernment / 認識",
    english: {
      word: "discernment",
      meaning: "careful judgment",
      simpleExplanation: "Seeing small differences clearly.",
      banglaMeaning: "বিচক্ষণতা",
      sentences: ["Discernment matters in study."],
      synonyms: ["judgment"],
      opposite: "confusion",
      speakingChallenge: "Use discernment once."
    },
    japanese: {
      word: "認識",
      reading: "にんしき",
      romaji: "ninshiki",
      meaning: "recognition",
      simpleExplanation: "Understanding something as true.",
      banglaMeaning: "স্বীকৃতি",
      sentences: [{ japanese: "問題を認識する。", reading: "もんだいをにんしきする。", english: "Recognize the problem." }],
      extraExamples: [{ japanese: "差を認識する。", reading: "さをにんしきする。", english: "Recognize the difference." }],
      synonyms: ["把握"],
      opposite: "誤解",
      speakingChallenge: "Use 認識 once.",
      kanjiFocus: {
        kanji: "認",
        radical: "言",
        components: ["言", "忍"],
        strokeCount: 14,
        strokeSteps: ["Write the speech radical."],
        memoryStory: "Words need patience before recognition.",
        sourceLinks: []
      }
    },
    microStory: "Discernment becomes recognition through review."
  };
}

function readingLabBody() {
  return {
    id: "reading-1",
    title: "Reading precision",
    theme: "Study",
    difficulty: "N1",
    estimatedMinutes: 13,
    focus: "Argument tracking",
    passage: ["短い文章です。"],
    argumentMap: [{ label: "Claim", content: "Read slowly." }],
    discourseMarkers: [],
    vocabulary: [],
    traps: [],
    questions: [
      {
        prompt: "What is the point?",
        choices: ["Read slowly", "Skip details"],
        answerIndex: 0,
        explanation: "The passage emphasizes slow reading."
      }
    ],
    paraphrases: [],
    rereadPlan: [],
    summaryChallenge: "Summarize the claim."
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
