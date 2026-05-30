import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { generateQuiz, type Quiz } from "@/lib/quiz.functions";

export const Route = createFileRoute("/generate")({
  head: () => ({
    meta: [
      { title: "Quiz Generator — StudyForge" },
      {
        name: "description",
        content:
          "Generate curriculum-aligned quizzes from any subject, topic or passage. CBC, KCSE and university-ready.",
      },
    ],
  }),
  component: GeneratePage,
});

const SUBJECTS = [
  // School subjects
  "Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics",
  "Geography", "History", "CRE", "IRE", "HRE", "Agriculture",
  "Computer Studies", "Business Studies",
  // College / TVET
  "Communication Skills", "Entrepreneurship", "Life Skills",
  "Accounting", "Economics", "ICT / Computing",
  "Electrical Engineering", "Mechanical Engineering", "Building & Construction",
  "Food & Beverage", "Hospitality", "Cosmetology", "Fashion & Design",
  "Plumbing", "Automotive", "Welding & Fabrication",
  "Nursing", "Clinical Medicine", "Pharmacy", "Public Health",
  "Early Childhood Education", "Social Work",
  // University units
  "Calculus", "Linear Algebra", "Statistics & Probability",
  "Microeconomics", "Macroeconomics", "Financial Accounting", "Marketing",
  "Organizational Behaviour", "Project Management", "Research Methods",
  "Data Structures & Algorithms", "Operating Systems", "Databases",
  "Software Engineering", "Computer Networks", "Artificial Intelligence",
  "Machine Learning", "Cyber Security", "Web Development",
  "Anatomy", "Physiology", "Biochemistry", "Microbiology", "Pathology",
  "Civil Engineering", "Electronics", "Thermodynamics", "Fluid Mechanics",
  "Constitutional Law", "Criminal Law", "Contract Law",
  "Psychology", "Sociology", "Political Science", "Philosophy",
  "Literature", "Linguistics",
  "Other (specify in topic)",
];

const LEVELS = [
  // Primary / Junior School (CBC/CBE)
  "Grade 1 (CBC)", "Grade 2 (CBC)", "Grade 3 (CBC)",
  "Grade 4 (CBC)", "Grade 5 (CBC)", "Grade 6 (CBC)",
  "Grade 7 (JSS)", "Grade 8 (JSS)", "Grade 9 (JSS)",
  // Senior School / Secondary
  "Grade 10 (Senior School)", "Grade 11 (Senior School)", "Grade 12 (Senior School)",
  "Form 1", "Form 2", "Form 3", "Form 4 (KCSE)",
  // TVET / Colleges
  "Artisan Certificate", "Craft Certificate", "Diploma (KNEC)",
  "Higher Diploma", "TVET — Level 4", "TVET — Level 5", "TVET — Level 6",
  // University
  "University — Year 1", "University — Year 2", "University — Year 3",
  "University — Year 4", "University — Year 5 / 6",
  "Postgraduate Diploma", "Masters", "PhD",
  // Professional bodies
  "CPA", "ACCA", "CFA", "CISA",
  "Professional certification / Other",
];

type Mode = "topic" | "passage";
type Difficulty = "easy" | "medium" | "difficult";
type QType = "mcq" | "short" | "essay" | "fill_blank" | "true_false" | "matching" | "structured" | "mixed";

function GeneratePage() {
  const generate = useServerFn(generateQuiz);

  const [mode, setMode] = useState<Mode>("topic");
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [unit, setUnit] = useState("");
  const [level, setLevel] = useState("Form 4 (KCSE)");
  const [passage, setPassage] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [qType, setQType] = useState<QType>("mcq");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  async function onGenerate() {
    setError(null);
    setQuiz(null);
    if (mode === "topic" && !topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    if (mode === "passage" && passage.trim().length < 40) {
      setError("Please paste a longer passage (at least 40 characters).");
      return;
    }
    setLoading(true);
    try {
      const result = await generate({
        data: {
          mode,
          subject: mode === "topic" ? subject : undefined,
          topic: mode === "topic" ? (unit.trim() ? `${topic} (Unit/Course: ${unit.trim()})` : topic) : undefined,
          level: mode === "topic" ? level : undefined,
          passage: mode === "passage" ? passage : undefined,
          count,
          difficulty,
          questionType: qType,
        },
      });
      setQuiz(result as Quiz);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg.includes("429") ? "Rate limit reached. Please try again in a moment." :
        msg.includes("402") ? "AI credits exhausted. Add credits in Workspace Settings → Usage." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            AI-powered · curriculum-aware
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Generate your <span className="text-gradient">quiz</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pick a source, set difficulty, and let StudyForge do the rest.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* Form */}
          <div className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-soft">
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
              <button
                onClick={() => setMode("topic")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  mode === "topic"
                    ? "bg-background text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="h-4 w-4" /> Topic
              </button>
              <button
                onClick={() => setMode("passage")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  mode === "passage"
                    ? "bg-background text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" /> Paragraph
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {mode === "topic" ? (
                <>
                  <Field label="Subject">
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="select-base"
                    >
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Topic">
                    <input
                      type="text"
                      placeholder="e.g. Quadratic equations, Cell division, Industrialisation"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="input-base"
                    />
                  </Field>
                  <Field label="Class / Level">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="select-base"
                    >
                      {LEVELS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                </>
              ) : (
                <Field label="Paste your text or passage">
                  <textarea
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                    rows={9}
                    placeholder="Paste notes, an article, or a comprehension passage…"
                    className="input-base resize-y"
                  />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Question type">
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QType)}
                    className="select-base"
                  >
                    <option value="mcq">Multiple choice</option>
                    <option value="short">Short answer</option>
                    <option value="essay">Essay</option>
                    <option value="fill_blank">Fill in the blanks</option>
                    <option value="true_false">True / False</option>
                    <option value="matching">Matching</option>
                    <option value="structured">Structured</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </Field>
                <Field label={`Questions: ${count}`}>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                  />
                </Field>
              </div>

              <Field label="Difficulty">
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "difficult"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-all ${
                        difficulty === d
                          ? "border-primary bg-gradient-hero text-primary-foreground shadow-glow"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>

              <button
                onClick={onGenerate}
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate quiz</>
                )}
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="min-h-[400px] rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-soft">
            {!quiz && !loading && (
              <EmptyState />
            )}
            {loading && <LoadingState />}
            {quiz && <QuizView quiz={quiz} onReset={() => setQuiz(null)} />}
          </div>
        </div>
      </div>

      <style>{`
        .input-base, .select-base {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-foreground);
          transition: var(--transition-smooth);
        }
        .input-base:focus, .select-base:focus {
          outline: none;
          border-color: var(--color-ring);
          box-shadow: 0 0 0 3px oklch(0.62 0.22 285 / 0.15);
        }
      `}</style>

      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero shadow-glow">
        <Sparkles className="h-7 w-7 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold">Your quiz will appear here</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Fill in the form on the left and click <span className="font-semibold text-foreground">Generate quiz</span> to begin.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 font-display text-lg font-semibold">Forging your quiz…</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Drafting curriculum-aligned questions and marking schemes.
      </p>
    </div>
  );
}

function QuizView({ quiz, onReset }: { quiz: Quiz; onReset: () => void }) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [revealAll, setRevealAll] = useState(false);

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">{quiz.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{quiz.curriculumNote}</p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={() => { setRevealAll((v) => !v); setRevealed({}); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {revealAll ? <><EyeOff className="h-3.5 w-3.5" /> Hide all</> : <><Eye className="h-3.5 w-3.5" /> Reveal all</>}
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      <ol className="space-y-4">
        {quiz.questions.map((q, i) => {
          const show = revealAll || revealed[i];
          return (
            <li key={i} className="rounded-xl border border-border/60 bg-background/60 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-hero text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-relaxed text-foreground">{q.question}</p>

                  {q.options && q.options.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {q.options.map((opt, j) => {
                        const isCorrect = show && opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                        return (
                          <li
                            key={j}
                            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                              isCorrect
                                ? "border-success/50 bg-success/10 text-foreground"
                                : "border-border/50 bg-card/40"
                            }`}
                          >
                            <span className="font-semibold text-muted-foreground">
                              {String.fromCharCode(65 + j)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-glow"
                  >
                    {show ? <><EyeOff className="h-3.5 w-3.5" /> Hide answer</> : <><Eye className="h-3.5 w-3.5" /> Reveal answer</>}
                  </button>

                  {show && (
                    <div className="mt-3 space-y-3 rounded-lg border border-accent/40 bg-accent/30 p-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-accent-foreground">Answer</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{q.answer}</p>
                      </div>
                      {q.steps && q.steps.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-accent-foreground">
                            Step-by-step solution
                          </p>
                          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-foreground">
                            {q.steps.map((s, k) => <li key={k}>{s}</li>)}
                          </ol>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-accent-foreground">Explanation</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
