import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Keyboard,
  Languages,
  Lightbulb,
  PenLine,
  Send,
  Sparkles,
  Target,
  XCircle
} from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type FormEvent,
  type Ref,
  type RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  AnswerFeedback,
  DailySession,
  DailyWordPair,
  DrillReviewFocus,
  JapaneseSentenceExample,
  KanaFeedback,
  KanaQuizItem,
  LearnerMemory,
  MemorySummary,
  ReadingLabPassage,
  StudyCategory,
  StudyItem
} from "./domain/types";

interface SessionResponse {
  session: DailySession;
  summary: MemorySummary;
  memory: LearnerMemory;
  feedback?: AnswerFeedback;
}

interface WordPairResponse {
  wordPair: DailyWordPair;
}

interface KanaQuizResponse {
  items: KanaQuizItem[];
  feedback?: KanaFeedback;
}

interface ReadingLabResponse {
  passage: ReadingLabPassage;
}

const categoryLabels: Record<StudyCategory, string> = {
  vocabulary: "Vocabulary",
  kanji: "Kanji",
  grammar: "Grammar",
  reading: "Reading"
};

type CockpitPanel = "drill" | "kana" | "reading" | "word" | "memory";
type WordPairPanel = "english" | "japanese" | "kanji" | "examples";

const cockpitTabs: Array<{ id: CockpitPanel; label: string; description: string }> = [
  { id: "drill", label: "Daily Drill", description: "N1 review queue" },
  { id: "kana", label: "Kana", description: "Keyboard practice" },
  { id: "reading", label: "Reading Lab", description: "Argument training" },
  { id: "word", label: "Word Pair", description: "Advanced language" },
  { id: "memory", label: "Memory", description: "Weak points" }
];

const wordPairTabs: Array<{ id: WordPairPanel; label: string }> = [
  { id: "english", label: "English" },
  { id: "japanese", label: "Japanese" },
  { id: "kanji", label: "Kanji" },
  { id: "examples", label: "Examples" }
];

const DWELL_ACTIVATION_DELAY_MS = 900;

type DwellButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const DwellButton = forwardRef<HTMLButtonElement, DwellButtonProps>(function DwellButton(
  { children, className, disabled, ...props },
  forwardedRef
) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dwellTimerRef = useRef<number | null>(null);
  const [dwellArmed, setDwellArmed] = useState(false);

  const clearDwell = useCallback(() => {
    if (dwellTimerRef.current !== null) {
      window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    setDwellArmed(false);
  }, []);

  const assignRef = useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      assignForwardedRef(forwardedRef, node);
    },
    [forwardedRef]
  );

  const startDwell = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onMouseEnter?.(event);
      if (event.defaultPrevented || disabled) {
        return;
      }

      clearDwell();
      setDwellArmed(true);
      dwellTimerRef.current = window.setTimeout(() => {
        dwellTimerRef.current = null;
        setDwellArmed(false);
        buttonRef.current?.click();
      }, DWELL_ACTIVATION_DELAY_MS);
    },
    [clearDwell, disabled, props]
  );

  const leaveDwell = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onMouseLeave?.(event);
      clearDwell();
    },
    [clearDwell, props]
  );

  const cancelDwellOnMouseDown = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onMouseDown?.(event);
      clearDwell();
    },
    [clearDwell, props]
  );

  const cancelDwellOnBlur = useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      props.onBlur?.(event);
      clearDwell();
    },
    [clearDwell, props]
  );

  const cancelDwellOnKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      props.onKeyDown?.(event);
      clearDwell();
    },
    [clearDwell, props]
  );

  useEffect(() => {
    if (disabled) {
      clearDwell();
    }
  }, [clearDwell, disabled]);

  useEffect(() => clearDwell, [clearDwell]);

  return (
    <button
      {...props}
      className={[className, dwellArmed ? "is-dwell-armed" : ""].filter(Boolean).join(" ")}
      disabled={disabled}
      onBlur={cancelDwellOnBlur}
      onKeyDown={cancelDwellOnKeyDown}
      onMouseDown={cancelDwellOnMouseDown}
      onMouseEnter={startDwell}
      onMouseLeave={leaveDwell}
      ref={assignRef}
    >
      {children}
      <span className="dwell-indicator" aria-hidden="true" />
    </button>
  );
});

function assignForwardedRef<T>(ref: Ref<T>, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

function App() {
  const [payload, setPayload] = useState<SessionResponse | null>(null);
  const [wordPair, setWordPair] = useState<DailyWordPair | null>(null);
  const [readingLab, setReadingLab] = useState<ReadingLabPassage | null>(null);
  const [kanaItems, setKanaItems] = useState<KanaQuizItem[]>([]);
  const [kanaIndex, setKanaIndex] = useState(0);
  const [kanaAnswer, setKanaAnswer] = useState("");
  const [kanaFeedback, setKanaFeedback] = useState<KanaFeedback | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<CockpitPanel>("drill");
  const answerInputRef = useRef<HTMLInputElement>(null);
  const kanaInputRef = useRef<HTMLInputElement>(null);
  const drillNextButtonRef = useRef<HTMLButtonElement>(null);
  const kanaNextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (!loading && activePanel === "drill" && !feedback) {
      answerInputRef.current?.focus();
    }
  }, [activePanel, currentIndex, feedback, loading]);

  useEffect(() => {
    if (feedback) {
      drillNextButtonRef.current?.focus();
    }
  }, [feedback]);

  useEffect(() => {
    if (!loading && activePanel === "kana" && !kanaFeedback) {
      kanaInputRef.current?.focus();
    }
  }, [activePanel, kanaFeedback, kanaIndex, loading]);

  useEffect(() => {
    if (kanaFeedback) {
      kanaNextButtonRef.current?.focus();
    }
  }, [kanaFeedback]);

  const currentItem = payload?.session.items[currentIndex] ?? null;
  const progress = payload ? `${Math.min(currentIndex + 1, payload.session.items.length)} / ${payload.session.items.length}` : "0 / 0";
  const drillInstruction = currentItem ? getInstruction(currentItem.category) : "";
  const weakList = useMemo(() => payload?.summary.weakItems.slice(0, 5) ?? [], [payload]);
  const activeTabLabel = cockpitTabs.find((tab) => tab.id === activePanel)?.label ?? "Daily Drill";
  const tabStatus: Record<CockpitPanel, { detail: string; value: string }> = {
    drill: { value: progress, detail: payload?.session.focusNote ?? "Today's queue" },
    kana: { value: kanaItems.length > 0 ? `${kanaIndex + 1} / ${kanaItems.length}` : "0 / 0", detail: "Keyboard practice" },
    reading: { value: readingLab ? `${readingLab.estimatedMinutes} min` : "Loading", detail: readingLab?.theme ?? "Argument training" },
    word: { value: wordPair?.title ?? "Loading", detail: "Advanced language" },
    memory: { value: `${payload?.summary.accuracy ?? 0}%`, detail: `${payload?.summary.dueCount ?? 0} due · ${weakList.length} weak` }
  };

  async function loadSession() {
    setLoading(true);
    setError(null);
    try {
      const [sessionResponse, wordPairResponse, kanaQuizResponse, readingLabResponse] = await Promise.all([
        fetch("/api/session"),
        fetch("/api/word-pair"),
        fetch("/api/kana-quiz"),
        fetch("/api/reading-lab")
      ]);
      if (!sessionResponse.ok) {
        throw new Error("Could not load today's drill.");
      }
      if (!wordPairResponse.ok) {
        throw new Error("Could not load today's word pair.");
      }
      if (!kanaQuizResponse.ok) {
        throw new Error("Could not load kana typing quiz.");
      }
      if (!readingLabResponse.ok) {
        throw new Error("Could not load N1 reading lab.");
      }
      const nextPayload = (await sessionResponse.json()) as SessionResponse;
      const nextWordPair = (await wordPairResponse.json()) as WordPairResponse;
      const nextKanaQuiz = (await kanaQuizResponse.json()) as KanaQuizResponse;
      const nextReadingLab = (await readingLabResponse.json()) as ReadingLabResponse;
      setPayload(nextPayload);
      setWordPair(nextWordPair.wordPair);
      setReadingLab(nextReadingLab.passage);
      setKanaItems(nextKanaQuiz.items);
      setKanaIndex(0);
      setKanaAnswer("");
      setKanaFeedback(null);
      setCurrentIndex(0);
      setFeedback(null);
      setAnswer("");
    } catch (sessionError) {
      setError(sessionError instanceof Error ? sessionError.message : "Could not load today's drill.");
    } finally {
      setLoading(false);
    }
  }

  async function submitKanaAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const item = kanaItems[kanaIndex];
    if (!item || kanaAnswer.trim().length === 0) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/kana-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, answer: kanaAnswer })
      });
      if (!response.ok) {
        throw new Error("Could not save kana answer.");
      }
      const nextPayload = (await response.json()) as KanaQuizResponse;
      setKanaItems(nextPayload.items);
      setKanaFeedback(nextPayload.feedback ?? null);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Could not save kana answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNextKana() {
    if (kanaItems.length === 0) {
      return;
    }

    setKanaIndex((index) => (index + 1) % kanaItems.length);
    setKanaAnswer("");
    setKanaFeedback(null);
  }

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentItem || answer.trim().length === 0) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: currentItem.id, answer })
      });
      if (!response.ok) {
        throw new Error("Could not save your answer.");
      }
      const nextPayload = (await response.json()) as SessionResponse;
      setPayload((previous) => ({
        ...nextPayload,
        session: previous?.session ?? nextPayload.session
      }));
      setFeedback(nextPayload.feedback ?? null);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Could not save your answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (!payload) {
      return;
    }

    if (currentIndex >= payload.session.items.length - 1) {
      void loadSession();
      return;
    }

    setCurrentIndex((index) => index + 1);
    setAnswer("");
    setFeedback(null);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">N2 passed · N1 preparation</p>
          <h1>N1 Study Cockpit</h1>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      {loading ? (
        <section className="loading-panel">Loading today&apos;s review queue...</section>
      ) : (
        <div className="cockpit">
          <nav className="study-tabs" role="tablist" aria-label="Study sections">
            {cockpitTabs.map((tab) => (
              <DwellButton
                className="study-tab"
                id={`study-tab-${tab.id}`}
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={activePanel === tab.id}
                aria-controls="study-panel"
                onClick={() => setActivePanel(tab.id)}
              >
                <span>{tab.label}</span>
                <strong>{tabStatus[tab.id].value}</strong>
                <small>{tabStatus[tab.id].detail || tab.description}</small>
              </DwellButton>
            ))}
          </nav>

          <section
            className="study-stage"
            id="study-panel"
            role="tabpanel"
            aria-labelledby={`study-tab-${activePanel}`}
            aria-label={activeTabLabel}
          >
            {activePanel === "drill" ? (
              <DailyDrillPanel
                answer={answer}
                currentIndex={currentIndex}
	                currentItem={currentItem}
	                drillInstruction={drillInstruction}
	                feedback={feedback}
	                inputRef={answerInputRef}
	                nextButtonRef={drillNextButtonRef}
	                onAnswerChange={setAnswer}
	                onNext={goNext}
                onSubmit={submitAnswer}
                payload={payload}
                progress={progress}
                submitting={submitting}
              />
            ) : null}

            {activePanel === "kana" ? (
              <KanaTypingPanel
	                answer={kanaAnswer}
	                currentIndex={kanaIndex}
	                feedback={kanaFeedback}
	                inputRef={kanaInputRef}
	                items={kanaItems}
	                nextButtonRef={kanaNextButtonRef}
	                onAnswerChange={setKanaAnswer}
                onNext={goNextKana}
                onSubmit={submitKanaAnswer}
                submitting={submitting}
              />
            ) : null}

            {activePanel === "word" ? <DailyWordPairPanel wordPair={wordPair} /> : null}

            {activePanel === "reading" ? <ReadingLabPanel passage={readingLab} /> : null}

            {activePanel === "memory" ? <MemoryPanel payload={payload} weakList={weakList} /> : null}
          </section>
        </div>
      )}
    </main>
  );
}

function DailyDrillPanel({
  answer,
  currentIndex,
  currentItem,
  drillInstruction,
  feedback,
  inputRef,
  nextButtonRef,
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
  drillInstruction: string;
  feedback: AnswerFeedback | null;
  inputRef: RefObject<HTMLInputElement | null>;
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  onAnswerChange: (answer: string) => void;
  onNext: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  payload: SessionResponse | null;
  progress: string;
  submitting: boolean;
}) {
  return (
    <section className="drill-panel" aria-label="Daily drill">
      <div className="drill-header">
        <div>
          <p className="eyebrow">Today&apos;s queue</p>
          <h2>Daily Drill</h2>
          <p className="panel-subtitle">{payload?.session.focusNote}</p>
        </div>
        <span className="progress-pill">{progress}</span>
      </div>

      <CategoryMeter counts={payload?.session.categoryCounts} />

      {currentItem ? (
        <article className="question-card">
          <div className="question-meta">
            <span>{categoryLabels[currentItem.category]}</span>
            <span>{currentItem.level}</span>
          </div>
          <p className="instruction">{drillInstruction}</p>
          <div className="prompt-text">{currentItem.prompt}</div>
          {currentItem.examples[0] ? (
            <div className="example-box">
              <p>{currentItem.examples[0].japanese}</p>
              <span>{currentItem.examples[0].english}</span>
            </div>
          ) : null}

          <form className="answer-form" onSubmit={onSubmit}>
            <label htmlFor="answer">Your answer</label>
            <div className="answer-row">
              <input
                id="answer"
                ref={inputRef}
                value={answer}
                onChange={(event) => onAnswerChange(event.target.value)}
                placeholder="Type kana, kanji reading, or English meaning"
                autoComplete="off"
                disabled={submitting || Boolean(feedback)}
              />
              <DwellButton type="submit" disabled={submitting || Boolean(feedback) || answer.trim().length === 0}>
                <Send size={18} aria-hidden="true" />
                Submit
              </DwellButton>
            </div>
          </form>

          {feedback ? (
            <FeedbackPanel
              buttonRef={nextButtonRef}
              feedback={feedback}
              onNext={onNext}
              finished={currentIndex >= (payload?.session.items.length ?? 1) - 1}
            />
          ) : null}
        </article>
      ) : (
        <article className="question-card">
          <div className="empty-state">No items are available. Add more seed items to continue studying.</div>
        </article>
      )}
    </section>
  );
}

function KanaTypingPanel({
  answer,
  currentIndex,
  feedback,
  inputRef,
  items,
  nextButtonRef,
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
  nextButtonRef: RefObject<HTMLButtonElement | null>;
  onAnswerChange: (answer: string) => void;
  onNext: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}) {
  const item = items[currentIndex] ?? null;

  return (
    <section className="kana-panel" aria-label="Kana typing quiz">
      <div className="lesson-header">
        <div>
          <p className="eyebrow">Keyboard practice</p>
          <h2>Kana Typing Quiz</h2>
        </div>
        <span className="lesson-title">{item ? `${currentIndex + 1} / ${items.length}` : "0 / 0"}</span>
      </div>

      {item ? (
        <article className="kana-card">
          <div className="question-meta">
            <span>{item.script}</span>
            <span>{item.romaji}</span>
          </div>
          <p className="instruction">{item.prompt}</p>
          <div className="kana-target">{item.target}</div>
          <p className="kana-hint">{item.keyboardTip}</p>

          <form className="answer-form" onSubmit={onSubmit}>
            <label htmlFor="kana-answer">Kana answer</label>
            <div className="answer-row">
              <input
                id="kana-answer"
                ref={inputRef}
                value={answer}
                onChange={(event) => onAnswerChange(event.target.value)}
                placeholder="Type the kana, not romaji"
                autoComplete="off"
                disabled={submitting || Boolean(feedback)}
              />
              <DwellButton type="submit" disabled={submitting || Boolean(feedback) || answer.trim().length === 0}>
                <Keyboard size={18} aria-hidden="true" />
                Check kana
              </DwellButton>
            </div>
          </form>

          {feedback ? (
            <div className={`feedback-panel ${feedback.correct ? "is-correct" : "is-incorrect"}`}>
              <div className="feedback-heading">
                {feedback.correct ? <CheckCircle2 size={22} aria-hidden="true" /> : <XCircle size={22} aria-hidden="true" />}
                <strong>{feedback.correct ? "Kana correct" : "Needs kana review"}</strong>
              </div>
              <dl>
                <div>
                  <dt>Expected</dt>
                  <dd>{feedback.expected}</dd>
                </div>
                <div>
                  <dt>Why</dt>
                  <dd>{feedback.explanation}</dd>
                </div>
                <div>
                  <dt>Keyboard</dt>
                  <dd>{feedback.keyboardTip}</dd>
                </div>
              </dl>
              <DwellButton className="next-button" type="button" onClick={onNext} ref={nextButtonRef}>
                Next kana
              </DwellButton>
            </div>
          ) : null}
        </article>
      ) : (
        <div className="empty-state">No kana quiz items are available.</div>
      )}
    </section>
  );
}

function ReadingLabPanel({ passage }: { passage: ReadingLabPassage | null }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const question = passage?.questions[0] ?? null;

  if (!passage) {
    return (
      <section className="reading-panel" aria-label="N1 reading lab">
        <div className="empty-state">No reading lab passage is available.</div>
      </section>
    );
  }

  return (
    <section className="reading-panel" aria-label="N1 reading lab">
      <div className="lesson-header">
        <div>
          <p className="eyebrow">Expert reading practice</p>
          <h2>N1 Reading Lab</h2>
          <p className="panel-subtitle">{passage.focus}</p>
        </div>
        <span className="lesson-title">{passage.estimatedMinutes} min · {passage.difficulty}</span>
      </div>

      <div className="reading-layout">
        <article className="reading-passage">
          <div className="block-title">
            <BookOpen size={20} aria-hidden="true" />
            <h3>{passage.title}</h3>
          </div>
          <p className="reading-theme">{passage.theme}</p>
          <div className="passage-text">
            {passage.passage.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="reading-analysis">
          <section className="reading-section">
            <h3>Argument map</h3>
            <ol className="argument-map">
              {passage.argumentMap.map((point) => (
                <li key={`${point.label}-${point.content}`}>
                  <strong>{point.label}</strong>
                  <span>{point.content}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="reading-section">
            <h3>Discourse markers</h3>
            <div className="marker-grid">
              {passage.discourseMarkers.map((marker) => (
                <div key={`${marker.marker}-${marker.function}`}>
                  <strong>{marker.marker}</strong>
                  <span>{marker.function}</span>
                  <p>{marker.cue}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="reading-section">
            <h3>Trap analysis</h3>
            <div className="trap-list">
              {passage.traps.map((trap) => (
                <article key={trap.label}>
                  <strong>{trap.label}</strong>
                  <p>{trap.trap}</p>
                  <span>{trap.whyItFails}</span>
                  <em>{trap.repair}</em>
                </article>
              ))}
            </div>
          </section>

          {question ? (
            <section className="reading-section">
              <h3>N1 question</h3>
              <p className="question-prompt">{question.prompt}</p>
              <ol className="choice-list">
                {question.choices.map((choice, index) => (
                  <li className={showAnswer && index === question.answerIndex ? "is-correct-choice" : ""} key={choice}>
                    <span>{index + 1}</span>
                    {choice}
                  </li>
                ))}
              </ol>
              <DwellButton className="reveal-button" type="button" onClick={() => setShowAnswer(true)} disabled={showAnswer}>
                <Target size={17} aria-hidden="true" />
                Reveal reading answer
              </DwellButton>
              {showAnswer ? (
                <div className="reading-answer">
                  <strong>Correct: {question.answerIndex + 1}</strong>
                  <p>{question.explanation}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="reading-section">
            <h3>Paraphrase recognition</h3>
            <div className="paraphrase-list">
              {passage.paraphrases.map((paraphrase) => (
                <article key={paraphrase.original}>
                  <p>{paraphrase.original}</p>
                  <span>{paraphrase.paraphrase}</span>
                  <em>{paraphrase.note}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="reading-section">
            <h3>Precision vocabulary</h3>
            <div className="vocab-grid">
              {passage.vocabulary.map((item) => (
                <div key={item.expression}>
                  <strong>{item.expression}</strong>
                  <span>{item.reading} · {item.meaning}</span>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="reading-section">
            <h3>Reread cycle</h3>
            <ol className="reread-list">
              {passage.rereadPlan.map((step) => (
                <li key={step.pass}>
                  <strong>{step.pass} · {step.minutes} min</strong>
                  <span>{step.goal}</span>
                </li>
              ))}
            </ol>
            <div className="challenge">
              <PenLine size={17} aria-hidden="true" />
              <span>{passage.summaryChallenge}</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function MemoryPanel({ payload, weakList }: { payload: SessionResponse | null; weakList: StudyItem[] }) {
  return (
    <section className="memory-panel" aria-label="Learner memory">
      <div className="panel-title">
        <BrainIcon />
        <div>
          <p className="eyebrow">Learner memory</p>
          <h2>Memory</h2>
        </div>
      </div>
      <div className="stat-grid">
        <StatCard icon={<BookOpen size={18} />} label="Taught" value={payload?.summary.taughtCount ?? 0} />
        <StatCard icon={<Target size={18} />} label="Due" value={payload?.summary.dueCount ?? 0} />
        <StatCard icon={<BarChart3 size={18} />} label="Reviews" value={payload?.summary.totalReviews ?? 0} />
        <StatCard icon={<Sparkles size={18} />} label="Accuracy" value={`${payload?.summary.accuracy ?? 0}%`} />
      </div>

      <div className="memory-strip">
        <section className="memory-section">
          <h3>Weak points</h3>
          {weakList.length > 0 ? (
            <ul className="memory-list">
              {weakList.map((item) => (
                <li key={item.id}>
                  <strong>{item.prompt}</strong>
                  <span>{item.reading} · {item.meaning}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Weak points will appear after missed answers.</p>
          )}
        </section>

        <section className="memory-section">
          <h3>Recent mistakes</h3>
          {payload && payload.summary.recentMistakes.length > 0 ? (
            <ul className="memory-list">
              {payload.summary.recentMistakes.map((mistake) => (
                <li key={`${mistake.itemId}-${mistake.missedAt}`}>
                  <strong>{mistake.wrongAnswer || "blank answer"}</strong>
                  <span>{mistake.correction}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Missed answers will be saved here and recycled into future drills.</p>
          )}
        </section>
      </div>
    </section>
  );
}

function DailyWordPairPanel({ wordPair }: { wordPair: DailyWordPair | null }) {
  const [activeWordPanel, setActiveWordPanel] = useState<WordPairPanel>("english");

  if (!wordPair) {
    return null;
  }

  const kanjiFocus = wordPair.japanese.kanjiFocus;

  return (
    <section className="word-pair-panel" aria-label="Daily word pair">
      <div className="lesson-header">
        <div>
          <p className="eyebrow">Advanced daily language</p>
          <h2>Daily Word Pair</h2>
        </div>
        <span className="lesson-title">{wordPair.title}</span>
      </div>

      <nav className="word-pair-tabs" role="tablist" aria-label="Daily word pair sections">
        {wordPairTabs.map((tab) => (
          <DwellButton
            className="word-pair-tab"
            id={`word-tab-${tab.id}`}
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={activeWordPanel === tab.id}
            aria-controls="word-pair-panel"
            onClick={() => setActiveWordPanel(tab.id)}
          >
            {tab.label}
          </DwellButton>
        ))}
      </nav>

      <div className="word-pair-stage" id="word-pair-panel" role="tabpanel" aria-labelledby={`word-tab-${activeWordPanel}`}>
        {activeWordPanel === "english" ? (
        <article className="lesson-block">
          <div className="block-title">
            <Languages size={20} aria-hidden="true" />
            <h3>{wordPair.english.word}</h3>
          </div>
          <p className="definition">{wordPair.english.meaning}</p>
          <p>{wordPair.english.simpleExplanation}</p>
          <p className="bangla">{wordPair.english.banglaMeaning}</p>
          <ExampleList examples={wordPair.english.sentences.map((sentence) => ({ japanese: sentence, reading: "", english: "" }))} mode="english" />
          <ChipLine label="Synonyms" values={wordPair.english.synonyms} />
          <ChipLine label="Opposite" values={[wordPair.english.opposite]} />
          <Challenge text={wordPair.english.speakingChallenge} />
        </article>
        ) : null}

        {activeWordPanel === "japanese" ? (
        <article className="lesson-block">
          <div className="block-title">
            <BookOpen size={20} aria-hidden="true" />
            <h3>{wordPair.japanese.word}</h3>
          </div>
          <p className="reading-line">
            {wordPair.japanese.reading}
            {wordPair.japanese.romaji ? <span> · {wordPair.japanese.romaji}</span> : null}
          </p>
          <p className="definition">{wordPair.japanese.meaning}</p>
          <p>{wordPair.japanese.simpleExplanation}</p>
          <p className="bangla">{wordPair.japanese.banglaMeaning}</p>
          <ExampleList examples={wordPair.japanese.sentences} mode="japanese" />
          <ChipLine label="Synonyms" values={wordPair.japanese.synonyms} />
          <ChipLine label="Opposite" values={[wordPair.japanese.opposite]} />
        </article>
        ) : null}

        {activeWordPanel === "kanji" ? (
      <section className="kanji-focus" aria-label={`Kanji focus ${kanjiFocus.kanji}`}>
        <div className="kanji-summary">
          <div className="kanji-mark">{kanjiFocus.kanji}</div>
          <div>
            <p className="eyebrow">Kanji focus</p>
            <h3>{kanjiFocus.kanji} · {kanjiFocus.strokeCount} strokes</h3>
            <p>Radical: {kanjiFocus.radical} · Components: {kanjiFocus.components.join(" + ")}</p>
          </div>
        </div>

        <div className="stroke-layout">
          {kanjiFocus.strokeOrderImagePath ? (
            <img
              className="stroke-image"
              src={kanjiFocus.strokeOrderImagePath}
              alt={`Stroke order for ${kanjiFocus.kanji}`}
            />
          ) : (
            <div className="stroke-fallback" aria-label={`Text stroke guide for ${kanjiFocus.kanji}`}>
              {kanjiFocus.strokeSteps.map((step, index) => (
                <div key={step}>
                  <strong>{index + 1}</strong>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
          <div>
            <ol className="stroke-steps">
              {kanjiFocus.strokeSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="memory-story">
              <Lightbulb size={18} aria-hidden="true" />
              <p>{kanjiFocus.memoryStory}</p>
            </div>
            <div className="source-links">
              {kanjiFocus.sourceLinks.map((source) => (
                <a href={source} key={source} target="_blank" rel="noreferrer">
                  Source
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
        ) : null}

        {activeWordPanel === "examples" ? (
          <>
      <section className="extra-examples">
        <h3>Extra Japanese examples</h3>
        <ExampleList examples={wordPair.japanese.extraExamples} mode="japanese" compact />
      </section>

      <div className="combined-challenge">
        <PenLine size={18} aria-hidden="true" />
        <div>
          <strong>Micro-story</strong>
          <p>{wordPair.microStory}</p>
          <strong>Speaking challenge</strong>
          <p>{wordPair.japanese.speakingChallenge}</p>
        </div>
      </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function ExampleList({
  compact = false,
  examples,
  mode
}: {
  compact?: boolean;
  examples: JapaneseSentenceExample[];
  mode: "english" | "japanese";
}) {
  return (
    <ol className={compact ? "example-list compact" : "example-list"}>
      {examples.map((example, index) => (
        <li key={`${example.japanese}-${index}`}>
          <p>{example.japanese}</p>
          {mode === "japanese" ? <span>{example.reading}</span> : null}
          {example.english ? <em>{example.english}</em> : null}
        </li>
      ))}
    </ol>
  );
}

function ChipLine({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="chip-line">
      <span>{label}</span>
      <div>
        {values.map((value) => (
          <strong key={value}>{value}</strong>
        ))}
      </div>
    </div>
  );
}

function Challenge({ text }: { text: string }) {
  return (
    <div className="challenge">
      <PenLine size={17} aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

function CategoryMeter({ counts }: { counts?: Record<StudyCategory, number> }) {
  return (
    <div className="category-meter" aria-label="Category mix">
      {Object.entries(categoryLabels).map(([category, label]) => (
        <div className="category-chip" key={category}>
          <span>{label}</span>
          <strong>{counts?.[category as StudyCategory] ?? 0}</strong>
        </div>
      ))}
    </div>
  );
}

function FeedbackPanel({
  buttonRef,
  feedback,
  finished,
  onNext
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  feedback: AnswerFeedback;
  finished: boolean;
  onNext: () => void;
}) {
  return (
    <div className={`feedback-panel ${feedback.correct ? "is-correct" : "is-incorrect"}`}>
      <div className="feedback-heading">
        {feedback.correct ? <CheckCircle2 size={22} aria-hidden="true" /> : <XCircle size={22} aria-hidden="true" />}
        <strong>{feedback.correct ? "Correct" : "Needs review"}</strong>
      </div>
      <dl>
        <div>
          <dt>Expected</dt>
          <dd>{feedback.expected}</dd>
        </div>
        <div>
          <dt>Why</dt>
          <dd>{feedback.explanation}</dd>
        </div>
        <div>
          <dt>Keyboard</dt>
          <dd>{feedback.keyboardTip}</dd>
        </div>
      </dl>
      {feedback.reviewFocus ? <ReviewFocusPanel reviewFocus={feedback.reviewFocus} /> : null}
      <DwellButton className="next-button" type="button" onClick={onNext} ref={buttonRef}>
        {finished ? "Refresh drill" : "Next item"}
      </DwellButton>
    </div>
  );
}

function ReviewFocusPanel({ reviewFocus }: { reviewFocus: DrillReviewFocus }) {
  const { kanjiFocus } = reviewFocus;

  return (
    <section className="review-focus" aria-label={`Review focus ${reviewFocus.word}`}>
      <div className="kanji-summary">
        <div className="kanji-mark">{kanjiFocus.kanji}</div>
        <div>
          <p className="eyebrow">Kanji review</p>
          <h3>{kanjiFocus.kanji} · {kanjiFocus.strokeCount} strokes</h3>
          <p>{reviewFocus.word} · {reviewFocus.reading} · {reviewFocus.meaning}</p>
          <p>Radical: {kanjiFocus.radical} · Components: {kanjiFocus.components.join(" + ")}</p>
        </div>
      </div>

      <p className="review-explanation">{reviewFocus.simpleExplanation}</p>

      <div className="stroke-layout review-stroke-layout">
        {kanjiFocus.strokeOrderImagePath ? (
          <img className="stroke-image" src={kanjiFocus.strokeOrderImagePath} alt={`Stroke order for ${kanjiFocus.kanji}`} />
        ) : (
          <div className="stroke-fallback" aria-label={`Text stroke guide for ${kanjiFocus.kanji}`}>
            {kanjiFocus.strokeSteps.map((step, index) => (
              <div key={step}>
                <strong>{index + 1}</strong>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
        <div>
          <ol className="stroke-steps">
            {kanjiFocus.strokeSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="memory-story">
            <Lightbulb size={18} aria-hidden="true" />
            <p>{kanjiFocus.memoryStory}</p>
          </div>
        </div>
      </div>

      <div className="review-examples">
        <section>
          <h4>Core examples</h4>
          <ExampleList examples={reviewFocus.examples} mode="japanese" compact />
        </section>
        {reviewFocus.extraExamples.length > 0 ? (
          <section>
            <h4>More patterns</h4>
            <ExampleList examples={reviewFocus.extraExamples.slice(0, 5)} mode="japanese" compact />
          </section>
        ) : null}
      </div>

      <div className="combined-challenge review-story">
        <PenLine size={18} aria-hidden="true" />
        <div>
          <strong>Memory story</strong>
          <p>{reviewFocus.microStory}</p>
        </div>
      </div>

      {kanjiFocus.sourceLinks.length > 0 ? (
        <div className="source-links">
          {kanjiFocus.sourceLinks.map((source) => (
            <a href={source} key={source} target="_blank" rel="noreferrer">
              Source
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="stat-card">
      <span aria-hidden="true">{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function BrainIcon() {
  return (
    <span className="brain-icon" aria-hidden="true">
      <Keyboard size={20} />
    </span>
  );
}

function getInstruction(category: StudyCategory): string {
  switch (category) {
    case "vocabulary":
      return "Type the hiragana reading or the English meaning.";
    case "kanji":
      return "Type the reading, meaning, or a recognition keyword.";
    case "grammar":
      return "Type the English nuance or the Japanese pattern reading.";
    case "reading":
      return "Answer the question with a Japanese or English keyword.";
  }
}

export default App;
