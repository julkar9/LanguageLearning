"use client";

import type {
  AnswerFeedback,
  DailyWordPair,
  JapaneseSentenceExample,
  KanaFeedback,
  KanaQuizItem,
  ReadingLabPassage,
  SessionResponse,
  StudyCategory,
  StudyItem
} from "@language-learning/api-contract";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@language-learning/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Keyboard,
  Languages,
  Loader2,
  PenLine,
  PlayCircle,
  Send,
  Sparkles,
  Target,
  XCircle
} from "lucide-react";
import type { FormEvent, ReactNode, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { tsr } from "@/lib/api";

type CockpitPanel = "drill" | "kana" | "reading" | "word" | "memory";
type WordPairPanel = "english" | "japanese" | "kanji" | "examples";
type DrillReviewFocusWithKanji = NonNullable<AnswerFeedback["reviewFocus"]>;
type ReviewKanjiFocus = NonNullable<AnswerFeedback["reviewFocus"]>["kanjiFocus"];

const categoryLabels: Record<StudyCategory, string> = {
  vocabulary: "Vocabulary",
  kanji: "Kanji",
  grammar: "Grammar",
  reading: "Reading"
};

const cockpitTabs: Array<{ id: CockpitPanel; label: string }> = [
  { id: "drill", label: "Daily Drill" },
  { id: "kana", label: "Kana" },
  { id: "reading", label: "Reading Lab" },
  { id: "word", label: "Word Pair" },
  { id: "memory", label: "Memory" }
];

const wordPairTabs: Array<{ id: WordPairPanel; label: string }> = [
  { id: "english", label: "English" },
  { id: "japanese", label: "Japanese" },
  { id: "kanji", label: "Kanji" },
  { id: "examples", label: "Examples" }
];

const categoryMeterOrder: StudyCategory[] = ["vocabulary", "kanji", "grammar", "reading"];
const dwellActivationMs = 850;
const dwellMoveTolerancePx = 6;

export function StudyCockpit() {
  const queryClient = useQueryClient();
  const [activePanel, setActivePanel] = useState<CockpitPanel>("drill");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [kanaIndex, setKanaIndex] = useState(0);
  const [kanaAnswer, setKanaAnswer] = useState("");
  const [kanaFeedback, setKanaFeedback] = useState<KanaFeedback | null>(null);
  const cockpitRef = useRef<HTMLElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const kanaInputRef = useRef<HTMLInputElement>(null);

  const sessionQuery = tsr.study.getSession.useQuery({ queryKey: ["study-session"] });
  const wordPairQuery = tsr.study.getWordPair.useQuery({ queryKey: ["study-word-pair"] });
  const kanaQuery = tsr.study.getKanaQuiz.useQuery({ queryKey: ["study-kana-quiz"] });
  const readingQuery = tsr.study.getReadingLab.useQuery({ queryKey: ["study-reading-lab"] });

  const refreshStudy = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["study-session"] }),
      queryClient.invalidateQueries({ queryKey: ["study-kana-quiz"] })
    ]);
  };

  const reviewMutation = tsr.study.submitReview.useMutation({
    onSuccess: async (result) => {
      setFeedback(result.body.feedback ?? null);
      await queryClient.invalidateQueries({ queryKey: ["study-session"] });
    }
  });

  const kanaMutation = tsr.study.submitKanaReview.useMutation({
    onSuccess: async (result) => {
      setKanaFeedback(result.body.feedback ?? null);
      await queryClient.invalidateQueries({ queryKey: ["study-kana-quiz"] });
      await queryClient.invalidateQueries({ queryKey: ["study-session"] });
    }
  });

  const payload = sessionQuery.data?.body ?? null;
  const wordPair = wordPairQuery.data?.body.wordPair ?? null;
  const kanaItems = kanaQuery.data?.body.items ?? [];
  const readingLab = readingQuery.data?.body.passage ?? null;
  const currentItem = payload?.session.items[currentIndex] ?? null;
  const progress = payload ? `${Math.min(currentIndex + 1, payload.session.items.length)} / ${payload.session.items.length}` : "0 / 0";
  const weakList = useMemo(() => payload?.summary.weakItems.slice(0, 5) ?? [], [payload]);
  const isLoading = sessionQuery.isPending || wordPairQuery.isPending || kanaQuery.isPending || readingQuery.isPending;
  const error = sessionQuery.error || wordPairQuery.error || kanaQuery.error || readingQuery.error;
  const mutationError = reviewMutation.error || kanaMutation.error;

  useDwellActivation(cockpitRef);

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentItem || answer.trim().length === 0 || reviewMutation.isPending) {
      return;
    }
    reviewMutation.mutate({ body: { itemId: currentItem.id, answer } });
  }

  function goNext() {
    if (!payload) {
      return;
    }

    if (currentIndex >= payload.session.items.length - 1) {
      setCurrentIndex(0);
      setFeedback(null);
      setAnswer("");
      void refreshStudy();
      return;
    }

    setCurrentIndex((index) => index + 1);
    setFeedback(null);
    setAnswer("");
    answerInputRef.current?.focus();
  }

  function submitKanaAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item = kanaItems[kanaIndex];
    if (!item || kanaAnswer.trim().length === 0 || kanaMutation.isPending) {
      return;
    }
    kanaMutation.mutate({ body: { itemId: item.id, answer: kanaAnswer } });
  }

  function goNextKana() {
    if (kanaItems.length === 0) {
      return;
    }

    setKanaIndex((index) => (index + 1) % kanaItems.length);
    setKanaAnswer("");
    setKanaFeedback(null);
    kanaInputRef.current?.focus();
  }

  useEffect(() => {
    if (activePanel === "drill" && feedback) {
      document.querySelector<HTMLButtonElement>("[data-study-next-action='drill']")?.focus();
    }
  }, [activePanel, feedback]);

  useEffect(() => {
    if (activePanel === "drill" && !feedback) {
      answerInputRef.current?.focus();
    }
  }, [activePanel, currentIndex, feedback]);

  useEffect(() => {
    if (activePanel === "kana" && kanaFeedback) {
      document.querySelector<HTMLButtonElement>("[data-study-next-action='kana']")?.focus();
    }
  }, [activePanel, kanaFeedback]);

  useEffect(() => {
    if (activePanel === "kana" && !kanaFeedback) {
      kanaInputRef.current?.focus();
    }
  }, [activePanel, kanaIndex, kanaFeedback]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (activePanel === "drill" && feedback) {
        event.preventDefault();
        goNext();
        return;
      }

      if (activePanel === "kana" && kanaFeedback) {
        event.preventDefault();
        goNextKana();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, feedback, kanaFeedback, goNext, goNextKana]);

  return (
    <main ref={cockpitRef} className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">N2 passed · N1 preparation</p>
          <h1 className="text-3xl font-bold tracking-normal">N1 Study Cockpit</h1>
        </div>
        <Button asChild variant="outline">
          <a href="/tasks">Tasks</a>
        </Button>
      </header>

      {error ? <ErrorBanner message="Could not load the study session from the API." /> : null}
      {mutationError ? <ErrorBanner message="Could not save the answer." /> : null}

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading today&apos;s review queue...
          </CardContent>
        </Card>
      ) : (
        <>
          <nav className="grid gap-2 md:grid-cols-5" role="tablist" aria-label="Study sections">
            {cockpitTabs.map((tab) => (
              <button
                className={
                  activePanel === tab.id
                    ? "rounded-md border bg-primary p-3 text-left text-primary-foreground"
                    : "rounded-md border bg-card p-3 text-left text-card-foreground hover:bg-muted"
                }
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={activePanel === tab.id}
                onClick={() => setActivePanel(tab.id)}
              >
                <span className="block text-sm font-semibold">{tab.label}</span>
                <span className="mt-1 block truncate text-xs opacity-80">{tabDetail(tab.id, payload, wordPair, readingLab, kanaItems, kanaIndex, progress, weakList.length)}</span>
              </button>
            ))}
          </nav>

          <section role="tabpanel" aria-label={activePanel}>
            {activePanel === "drill" ? (
              <DailyDrillPanel
                answer={answer}
                currentIndex={currentIndex}
                currentItem={currentItem}
                feedback={feedback}
                inputRef={answerInputRef}
                onAnswerChange={setAnswer}
                onNext={goNext}
                onSubmit={submitAnswer}
                payload={payload}
                progress={progress}
                submitting={reviewMutation.isPending}
              />
            ) : null}

            {activePanel === "kana" ? (
              <KanaTypingPanel
                answer={kanaAnswer}
                currentIndex={kanaIndex}
                feedback={kanaFeedback}
                inputRef={kanaInputRef}
                items={kanaItems}
                onAnswerChange={setKanaAnswer}
                onNext={goNextKana}
                onSubmit={submitKanaAnswer}
                submitting={kanaMutation.isPending}
              />
            ) : null}

            {activePanel === "reading" ? <ReadingLabPanel passage={readingLab} /> : null}
            {activePanel === "word" ? <DailyWordPairPanel wordPair={wordPair} /> : null}
            {activePanel === "memory" ? <MemoryPanel payload={payload} weakList={weakList} /> : null}
          </section>
        </>
      )}
    </main>
  );
}

function DailyDrillPanel({
  answer,
  currentIndex,
  currentItem,
  feedback,
  inputRef,
  onAnswerChange,
  onNext,
  onSubmit,
  payload,
  progress,
  submitting
}: {
  answer: string;
  currentIndex: number;
  currentItem: StudyItem | null;
  feedback: AnswerFeedback | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onAnswerChange: (answer: string) => void;
  onNext: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  payload: SessionResponse | null;
  progress: string;
  submitting: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Daily Drill</CardTitle>
          <CardDescription>{payload?.session.focusNote}</CardDescription>
        </div>
        <span className="rounded-md border bg-muted px-3 py-1 text-sm font-semibold">{progress}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoryMeter counts={payload?.session.categoryCounts} />

        {currentItem ? (
          <article className="space-y-4 rounded-md border bg-background p-4">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <span>{categoryLabels[currentItem.category]}</span>
              <span>{currentItem.level}</span>
            </div>
            <p className="text-sm text-muted-foreground">{getInstruction(currentItem.category)}</p>
            <div className="text-5xl font-bold">{currentItem.prompt}</div>
            {currentItem.examples[0] ? (
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-semibold">{currentItem.examples[0].japanese}</p>
                <p className="mt-1 text-muted-foreground">{currentItem.examples[0].english}</p>
              </div>
            ) : null}

            <form className="space-y-2" onSubmit={onSubmit}>
              <label className="text-sm font-semibold" htmlFor="answer">
                Your answer
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="answer"
                  ref={inputRef}
                  value={answer}
                  onChange={(event) => onAnswerChange(event.target.value)}
                  placeholder="Type kana, reading, or English meaning"
                  autoComplete="off"
                  disabled={submitting || Boolean(feedback)}
                />
                <Button disabled={submitting || Boolean(feedback) || answer.trim().length === 0} type="submit">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  Submit
                </Button>
              </div>
            </form>

            {feedback ? (
              <FeedbackPanel feedback={feedback} finished={currentIndex >= (payload?.session.items.length ?? 1) - 1} onNext={onNext} />
            ) : null}
          </article>
        ) : (
          <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">No items are available.</div>
        )}
      </CardContent>
    </Card>
  );
}

function KanaTypingPanel({
  answer,
  currentIndex,
  feedback,
  inputRef,
  items,
  onAnswerChange,
  onNext,
  onSubmit,
  submitting
}: {
  answer: string;
  currentIndex: number;
  feedback: KanaFeedback | null;
  inputRef: RefObject<HTMLInputElement | null>;
  items: KanaQuizItem[];
  onAnswerChange: (answer: string) => void;
  onNext: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}) {
  const item = items[currentIndex] ?? null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Kana Typing Quiz</CardTitle>
          <CardDescription>Keyboard practice</CardDescription>
        </div>
        <span className="rounded-md border bg-muted px-3 py-1 text-sm font-semibold">{item ? `${currentIndex + 1} / ${items.length}` : "0 / 0"}</span>
      </CardHeader>
      <CardContent>
        {item ? (
          <article className="space-y-4 rounded-md border bg-background p-4">
            <div className="flex gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <span>{item.script}</span>
              <span>{item.romaji}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.prompt}</p>
            <div className="text-6xl font-bold">{item.target}</div>
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{item.keyboardTip}</p>

            <form className="space-y-2" onSubmit={onSubmit}>
              <label className="text-sm font-semibold" htmlFor="kana-answer">
                Kana answer
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="kana-answer"
                  ref={inputRef}
                  value={answer}
                  onChange={(event) => onAnswerChange(event.target.value)}
                  placeholder="Type kana, not romaji"
                  autoComplete="off"
                  disabled={submitting || Boolean(feedback)}
                />
                <Button disabled={submitting || Boolean(feedback) || answer.trim().length === 0} type="submit">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Keyboard className="h-4 w-4" aria-hidden="true" />}
                  Check kana
                </Button>
              </div>
            </form>

            {feedback ? (
              <div className={feedback.correct ? "rounded-md border bg-muted p-4" : "rounded-md border border-destructive bg-background p-4"}>
                <div className="flex items-center gap-2 font-semibold">
                  {feedback.correct ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />}
                  <span>{feedback.correct ? "Kana correct" : "Needs kana review"}</span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm">
                  <InfoRow label="Expected" value={feedback.expected} />
                  <InfoRow label="Why" value={feedback.explanation} />
                  <InfoRow label="Keyboard" value={feedback.keyboardTip} />
                </dl>
                <Button className="mt-4" type="button" onClick={onNext} data-study-next-action="kana">
                  Next kana
                </Button>
              </div>
            ) : null}
          </article>
        ) : (
          <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">No kana quiz items are available.</div>
        )}
      </CardContent>
    </Card>
  );
}

function ReadingLabPanel({ passage }: { passage: ReadingLabPassage | null }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const question = passage?.questions[0] ?? null;

  if (!passage) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">No reading lab passage is available.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>N1 Reading Lab</CardTitle>
          <CardDescription>{passage.focus}</CardDescription>
        </div>
        <span className="rounded-md border bg-muted px-3 py-1 text-sm font-semibold">{passage.estimatedMinutes} min</span>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-md border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{passage.title}</h2>
          </div>
          <p className="mb-4 text-sm font-semibold text-muted-foreground">{passage.theme}</p>
          <div className="space-y-3 text-base leading-8">
            {passage.passage.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="space-y-4">
          <PanelSection title="Argument map">
            <ol className="space-y-2 text-sm">
              {passage.argumentMap.map((point) => (
                <li className="rounded-md bg-muted p-3" key={`${point.label}-${point.content}`}>
                  <strong>{point.label}</strong>
                  <p className="mt-1 text-muted-foreground">{point.content}</p>
                </li>
              ))}
            </ol>
          </PanelSection>

          <PanelSection title="Trap analysis">
            <div className="space-y-2">
              {passage.traps.map((trap) => (
                <article className="rounded-md bg-muted p-3 text-sm" key={trap.label}>
                  <strong>{trap.label}</strong>
                  <p className="mt-1">{trap.trap}</p>
                  <p className="mt-1 text-muted-foreground">{trap.whyItFails}</p>
                  <p className="mt-1 font-semibold">{trap.repair}</p>
                </article>
              ))}
            </div>
          </PanelSection>

          {question ? (
            <PanelSection title="N1 question">
              <p className="text-sm font-semibold">{question.prompt}</p>
              <ol className="mt-3 space-y-2 text-sm">
                {question.choices.map((choice, index) => (
                  <li className={showAnswer && index === question.answerIndex ? "rounded-md border bg-muted p-2 font-semibold" : "rounded-md border p-2"} key={choice}>
                    {index + 1}. {choice}
                  </li>
                ))}
              </ol>
              <Button className="mt-3" type="button" onClick={() => setShowAnswer(true)} disabled={showAnswer}>
                <Target className="h-4 w-4" aria-hidden="true" />
                Reveal answer
              </Button>
              {showAnswer ? (
                <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                  <strong>Correct: {question.answerIndex + 1}</strong>
                  <p className="mt-1 text-muted-foreground">{question.explanation}</p>
                </div>
              ) : null}
            </PanelSection>
          ) : null}

          <PanelSection title="Precision vocabulary">
            <div className="grid gap-2">
              {passage.vocabulary.map((item) => (
                <div className="rounded-md bg-muted p-3 text-sm" key={item.expression}>
                  <strong>{item.expression}</strong>
                  <p className="text-muted-foreground">{item.reading} · {item.meaning}</p>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </PanelSection>
        </div>
      </CardContent>
    </Card>
  );
}

function DailyWordPairPanel({ wordPair }: { wordPair: DailyWordPair | null }) {
  const [activeWordPanel, setActiveWordPanel] = useState<WordPairPanel>("english");

  if (!wordPair) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">No daily word pair is available.</CardContent>
      </Card>
    );
  }

  const kanjiFocus = wordPair.japanese.kanjiFocus;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Daily Word Pair</CardTitle>
          <CardDescription>{wordPair.title}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <nav className="grid gap-2 sm:grid-cols-4" role="tablist" aria-label="Daily word pair sections">
          {wordPairTabs.map((tab) => (
            <button
              className={
                activeWordPanel === tab.id
                  ? "rounded-md border bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                  : "rounded-md border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted"
              }
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeWordPanel === tab.id}
              onClick={() => setActiveWordPanel(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeWordPanel === "english" ? (
          <LessonBlock title={wordPair.english.word} icon={<Languages className="h-5 w-5" aria-hidden="true" />}>
            <p className="text-lg font-semibold">{wordPair.english.meaning}</p>
            <p>{wordPair.english.simpleExplanation}</p>
            <p className="rounded-md bg-muted p-3 font-semibold">{wordPair.english.banglaMeaning}</p>
            <ExampleList examples={wordPair.english.sentences.map((sentence) => ({ japanese: sentence, reading: "", english: "" }))} mode="english" />
            <ChipLine label="Synonyms" values={wordPair.english.synonyms} />
            <ChipLine label="Opposite" values={[wordPair.english.opposite]} />
            <Challenge text={wordPair.english.speakingChallenge} />
          </LessonBlock>
        ) : null}

        {activeWordPanel === "japanese" ? (
          <LessonBlock title={wordPair.japanese.word} icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}>
            <p className="text-sm font-semibold text-muted-foreground">
              {wordPair.japanese.reading}
              {wordPair.japanese.romaji ? <span> · {wordPair.japanese.romaji}</span> : null}
            </p>
            <p className="text-lg font-semibold">{wordPair.japanese.meaning}</p>
            <p>{wordPair.japanese.simpleExplanation}</p>
            <p className="rounded-md bg-muted p-3 font-semibold">{wordPair.japanese.banglaMeaning}</p>
            <ExampleList examples={wordPair.japanese.sentences} mode="japanese" />
            <ChipLine label="Synonyms" values={wordPair.japanese.synonyms} />
            <ChipLine label="Opposite" values={[wordPair.japanese.opposite]} />
          </LessonBlock>
        ) : null}

        {activeWordPanel === "kanji" ? (
          <section className="rounded-md border bg-background p-4">
            <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
              <div className="flex aspect-square items-center justify-center rounded-md bg-muted text-7xl font-bold">{kanjiFocus.kanji}</div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  {kanjiFocus.kanji} · {kanjiFocus.strokeCount} strokes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Radical: {kanjiFocus.radical} · Components: {kanjiFocus.components.join(" + ")}
                </p>
                {kanjiFocus.strokeOrderImagePath ? (
                  <img className="max-h-64 rounded-md border bg-card object-contain p-2" src={kanjiFocus.strokeOrderImagePath} alt={`Stroke order for ${kanjiFocus.kanji}`} />
                ) : null}
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {kanjiFocus.strokeSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="rounded-md bg-muted p-3 text-sm">{kanjiFocus.memoryStory}</div>
              </div>
            </div>
          </section>
        ) : null}

        {activeWordPanel === "examples" ? (
          <LessonBlock title="Extra examples" icon={<PenLine className="h-5 w-5" aria-hidden="true" />}>
            <ExampleList examples={wordPair.japanese.extraExamples} mode="japanese" />
            <div className="rounded-md bg-muted p-3">
              <strong>Micro-story</strong>
              <p className="mt-1">{wordPair.microStory}</p>
              <strong className="mt-3 block">Speaking challenge</strong>
              <p className="mt-1">{wordPair.japanese.speakingChallenge}</p>
            </div>
          </LessonBlock>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MemoryPanel({ payload, weakList }: { payload: SessionResponse | null; weakList: StudyItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory</CardTitle>
        <CardDescription>Learner memory and weak points</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard icon={<BookOpen className="h-4 w-4" />} label="Taught" value={payload?.summary.taughtCount ?? 0} />
          <StatCard icon={<Target className="h-4 w-4" />} label="Due" value={payload?.summary.dueCount ?? 0} />
          <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Reviews" value={payload?.summary.totalReviews ?? 0} />
          <StatCard icon={<Sparkles className="h-4 w-4" />} label="Accuracy" value={`${payload?.summary.accuracy ?? 0}%`} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PanelSection title="Weak points">
            {weakList.length > 0 ? (
              <ul className="space-y-2">
                {weakList.map((item) => (
                  <li className="rounded-md bg-muted p-3 text-sm" key={item.id}>
                    <strong>{item.prompt}</strong>
                    <p className="text-muted-foreground">{item.reading} · {item.meaning}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Weak points will appear after missed answers.</p>
            )}
          </PanelSection>

          <PanelSection title="Recent mistakes">
            {payload && payload.summary.recentMistakes.length > 0 ? (
              <ul className="space-y-2">
                {payload.summary.recentMistakes.map((mistake) => (
                  <li className="rounded-md bg-muted p-3 text-sm" key={`${mistake.itemId}-${mistake.missedAt}`}>
                    <strong>{mistake.wrongAnswer || "blank answer"}</strong>
                    <p className="text-muted-foreground">{mistake.correction}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Missed answers will be saved here.</p>
            )}
          </PanelSection>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackPanel({ feedback, finished, onNext }: { feedback: AnswerFeedback; finished: boolean; onNext: () => void }) {
  return (
    <div className={feedback.correct ? "rounded-md border bg-muted p-4" : "rounded-md border border-destructive bg-background p-4"}>
      <div className="flex items-center gap-2 font-semibold">
        {feedback.correct ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />}
        <span>{feedback.correct ? "Correct" : "Needs review"}</span>
      </div>
      <dl className="mt-3 grid gap-2 text-sm">
        <InfoRow label="Expected" value={feedback.expected} />
        <InfoRow label="Why" value={feedback.explanation} />
        <InfoRow label="Keyboard" value={feedback.keyboardTip} />
      </dl>
      {feedback.reviewFocus ? (
        <div className="mt-4 rounded-md bg-muted p-3 text-sm">
          <strong>
            {feedback.reviewFocus.word} · {feedback.reviewFocus.reading}
          </strong>
          <p className="mt-1">{feedback.reviewFocus.simpleExplanation}</p>
          <p className="mt-1 text-muted-foreground">{feedback.reviewFocus.microStory}</p>
        </div>
      ) : null}
      {feedback.reviewFocus ? <KanjiMemoryBlock kanjiFocus={feedback.reviewFocus.kanjiFocus} /> : null}
      {feedback.reviewFocus ? <N1PracticeBlock reviewFocus={feedback.reviewFocus} /> : null}
      <Button className="mt-4" type="button" onClick={onNext} data-study-next-action="drill">
        {finished ? "Refresh drill" : "Next item"}
      </Button>
    </div>
  );
}

function CategoryMeter({ counts }: { counts: Record<StudyCategory, number> | undefined }) {
  if (!counts) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {categoryMeterOrder.map((category) => (
        <div className="rounded-md border bg-muted p-3" key={category}>
          <span className="block text-xs font-semibold uppercase text-muted-foreground">{categoryLabels[category]}</span>
          <strong className="mt-1 block text-lg">{counts[category]}</strong>
        </div>
      ))}
    </div>
  );
}

function LessonBlock({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <article className="space-y-3 rounded-md border bg-background p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </article>
  );
}

function KanjiMemoryBlock({ kanjiFocus }: { kanjiFocus: ReviewKanjiFocus }) {
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${kanjiFocus.kanji} kanji stroke order story`)}`;

  return (
    <section className="mt-4 rounded-md border bg-background p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Kanji memory</h3>
          <p className="mt-1 text-lg font-semibold">
            {kanjiFocus.kanji} · {kanjiFocus.strokeCount} strokes
          </p>
        </div>
        <a className="inline-flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm font-semibold hover:bg-card" href={youtubeUrl} target="_blank" rel="noreferrer">
          <PlayCircle className="h-4 w-4" aria-hidden="true" />
          Watch stroke/story videos
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-[9rem_1fr]">
        <div className="flex aspect-square items-center justify-center rounded-md bg-muted text-7xl font-bold">{kanjiFocus.kanji}</div>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Radical: {kanjiFocus.radical} · Components: {kanjiFocus.components.join(" + ")}
          </p>
          {kanjiFocus.strokeOrderImagePath ? (
            <img className="max-h-56 rounded-md border bg-card object-contain p-2" src={kanjiFocus.strokeOrderImagePath} alt={`Stroke order for ${kanjiFocus.kanji}`} />
          ) : null}
          <div className="rounded-md bg-muted p-3 text-sm">{kanjiFocus.memoryStory}</div>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {kanjiFocus.strokeSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            {kanjiFocus.sourceLinks.map((sourceLink, index) => (
              <a className="rounded-md border px-2 py-1 text-xs font-semibold hover:bg-muted" href={sourceLink} key={sourceLink} target="_blank" rel="noreferrer">
                {sourceLabel(sourceLink, index)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function sourceLabel(sourceLink: string, index: number) {
  try {
    const host = new URL(sourceLink).hostname.replace(/^www\./, "");
    if (host.includes("jitenon")) {
      return "Jitenon";
    }
    if (host.includes("japandict")) {
      return "JapanDict";
    }
    if (host.includes("kanjivg")) {
      return "KanjiVG";
    }
    if (host.includes("githubusercontent")) {
      return "Stroke diagram";
    }
    return host;
  } catch {
    return `Source ${index + 1}`;
  }
}

function N1PracticeBlock({ reviewFocus }: { reviewFocus: DrillReviewFocusWithKanji }) {
  const readingExamples = reviewFocus.examples.length > 0 ? reviewFocus.examples : reviewFocus.extraExamples;
  const paragraphExamples = readingExamples.slice(0, 3);
  const vocabularyExamples = reviewFocus.extraExamples.length > 0 ? reviewFocus.extraExamples : reviewFocus.examples;

  return (
    <section className="mt-4 rounded-md border bg-background p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">N1 practice</h3>
        <p className="mt-1 text-lg font-semibold">
          Reading, vocabulary, and grammar with {reviewFocus.kanjiFocus.kanji}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <PracticeSection title="Japanese paragraph">
            <p className="text-base leading-7">{paragraphExamples.map((example) => example.japanese).join(" ")}</p>
          </PracticeSection>
          <PracticeSection title="English translation">
            <p className="text-sm leading-6">{paragraphExamples.map((example) => example.english).join(" ")}</p>
          </PracticeSection>
        </div>

        <div className="space-y-3">
          <PracticeSection title="Reading support">
            <ul className="space-y-1 text-sm">
              {paragraphExamples.map((example) => (
                <li key={`${example.japanese}-${example.reading}`}>
                  <strong>{example.japanese}</strong>
                  <span className="block text-muted-foreground">{example.reading || reviewFocus.reading}</span>
                </li>
              ))}
            </ul>
          </PracticeSection>
          <PracticeSection title="Grammar / usage">
            <p className="text-sm leading-6">{usageCue(reviewFocus.word)}</p>
          </PracticeSection>
        </div>
      </div>

      <PracticeSection title="Vocabulary in context" className="mt-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {vocabularyExamples.slice(0, 4).map((example) => (
            <div className="rounded-md bg-muted p-3 text-sm" key={`${example.japanese}-${example.english}`}>
              <strong>{example.japanese}</strong>
              <p className="text-muted-foreground">{example.reading || reviewFocus.reading}</p>
              <p>{example.english}</p>
            </div>
          ))}
        </div>
      </PracticeSection>
    </section>
  );
}

function PracticeSection({ children, className = "", title }: { children: ReactNode; className?: string; title: string }) {
  return (
    <section className={`rounded-md bg-muted p-3 ${className}`}>
      <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</h4>
      {children}
    </section>
  );
}

function usageCue(word: string) {
  if (word.endsWith("しい")) {
    return `${word} is an i-adjective. In N1 reading, watch for it before a noun, after が/は, or in the adverb form ending in しく when the sentence describes degree, criticism, damage, gap, or severity.`;
  }
  if (word.endsWith("する")) {
    return `${word} works as a suru-verb. In N1 reading, check what object or abstract issue is being acted on, then connect it to the sentence's cause or result.`;
  }
  if (word.endsWith("す")) {
    return `${word} is a verb form. In N1 reading, identify who or what causes the action, then check the phrase after を, に, or が to see the target of that action.`;
  }
  return `${word} is likely to appear inside formal N1 vocabulary. Check the surrounding particles and modifiers first, then connect the word to the author's claim, contrast, or conclusion.`;
}

function PanelSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-md border bg-background p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function ExampleList({ examples, mode }: { examples: JapaneseSentenceExample[]; mode: "english" | "japanese" }) {
  return (
    <ol className="space-y-2">
      {examples.map((example, index) => (
        <li className="rounded-md bg-muted p-3 text-sm" key={`${example.japanese}-${index}`}>
          <p className="font-semibold">{example.japanese}</p>
          {mode === "japanese" ? <p className="text-muted-foreground">{example.reading}</p> : null}
          {example.english ? <p>{example.english}</p> : null}
        </li>
      ))}
    </ol>
  );
}

function ChipLine({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold text-muted-foreground">{label}</span>
      {values.map((value) => (
        <span className="rounded-md border bg-muted px-2 py-1" key={value}>
          {value}
        </span>
      ))}
    </div>
  );
}

function Challenge({ text }: { text: string }) {
  return (
    <div className="flex gap-2 rounded-md bg-muted p-3 text-sm">
      <PenLine className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-background p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <strong className="mt-2 block text-2xl">{value}</strong>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-md border border-destructive bg-background p-4 text-sm text-destructive">{message}</div>;
}

function useDwellActivation(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const root = container;
    let timer: number | null = null;
    let target: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let latestX = 0;
    let latestY = 0;

    function clearDwell() {
      if (timer) {
        window.clearTimeout(timer);
      }

      target?.removeAttribute("data-dwell-active");
      timer = null;
      target = null;
    }

    function getActivatableTarget(eventTarget: EventTarget | null) {
      if (!(eventTarget instanceof Element)) {
        return null;
      }

      const candidate = eventTarget.closest<HTMLElement>("button, a[href]");
      if (!candidate || !root.contains(candidate)) {
        return null;
      }
      if (candidate instanceof HTMLButtonElement && candidate.disabled) {
        return null;
      }
      if (candidate.getAttribute("aria-disabled") === "true") {
        return null;
      }

      return candidate;
    }

    function scheduleDwell(nextTarget: HTMLElement, event: PointerEvent) {
      target?.removeAttribute("data-dwell-active");
      target = nextTarget;
      startX = event.clientX;
      startY = event.clientY;
      latestX = event.clientX;
      latestY = event.clientY;
      target.setAttribute("data-dwell-active", "true");

      if (timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(() => {
        const currentTarget = target;
        clearDwell();

        if (currentTarget && isPointerOverTarget(currentTarget, latestX, latestY)) {
          currentTarget.click();
        }
      }, dwellActivationMs);
    }

    function handlePointerOver(event: PointerEvent) {
      if (event.pointerType === "touch") {
        return;
      }

      const nextTarget = getActivatableTarget(event.target);
      if (!nextTarget || nextTarget === target) {
        return;
      }

      scheduleDwell(nextTarget, event);
    }

    function handlePointerMove(event: PointerEvent) {
      if (!target) {
        return;
      }

      latestX = event.clientX;
      latestY = event.clientY;

      if (Math.hypot(latestX - startX, latestY - startY) <= dwellMoveTolerancePx) {
        return;
      }

      const currentTarget = getActivatableTarget(event.target);
      if (currentTarget) {
        scheduleDwell(currentTarget, event);
      } else {
        clearDwell();
      }
    }

    function handlePointerOut(event: PointerEvent) {
      if (!target) {
        return;
      }

      if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) {
        return;
      }

      clearDwell();
    }

    root.addEventListener("pointerover", handlePointerOver);
    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerout", handlePointerOut);
    root.addEventListener("pointercancel", clearDwell);
    root.addEventListener("pointerdown", clearDwell);

    return () => {
      clearDwell();
      root.removeEventListener("pointerover", handlePointerOver);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerout", handlePointerOut);
      root.removeEventListener("pointercancel", clearDwell);
      root.removeEventListener("pointerdown", clearDwell);
    };
  }, [containerRef]);
}

function isPointerOverTarget(target: HTMLElement, x: number, y: number) {
  if (typeof document.elementFromPoint !== "function") {
    return true;
  }

  const element = document.elementFromPoint(x, y);
  return element ? target.contains(element) || element === target : true;
}

function getInstruction(category: StudyCategory): string {
  if (category === "vocabulary") {
    return "Give the reading or meaning.";
  }
  if (category === "kanji") {
    return "Give the reading or core meaning.";
  }
  if (category === "grammar") {
    return "Explain the grammar point or its meaning.";
  }
  return "Answer the reading comprehension prompt.";
}

function tabDetail(
  id: CockpitPanel,
  payload: SessionResponse | null,
  wordPair: DailyWordPair | null,
  readingLab: ReadingLabPassage | null,
  kanaItems: KanaQuizItem[],
  kanaIndex: number,
  progress: string,
  weakCount: number
): string {
  if (id === "drill") {
    return progress;
  }
  if (id === "kana") {
    return kanaItems.length > 0 ? `${kanaIndex + 1} / ${kanaItems.length}` : "0 / 0";
  }
  if (id === "reading") {
    return readingLab ? `${readingLab.estimatedMinutes} min` : "Loading";
  }
  if (id === "word") {
    return wordPair?.title ?? "Loading";
  }
  return `${payload?.summary.accuracy ?? 0}% · ${weakCount} weak`;
}
