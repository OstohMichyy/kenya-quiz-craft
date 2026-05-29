import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  Calculator,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyForge — AI Quiz Generator for CBC, KCSE & University" },
      {
        name: "description",
        content:
          "Generate curriculum-aligned quizzes, revision questions, and step-by-step Mathematics solutions instantly. Built for Kenyan students and teachers.",
      },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Brain,
    title: "AI Quiz Generator",
    body: "Pick a subject, topic and level. Get instant CBC, KCSE or university-style questions in seconds.",
  },
  {
    icon: FileText,
    title: "Paragraph → Quiz",
    body: "Paste notes or a passage. StudyForge extracts key concepts and builds comprehension questions.",
  },
  {
    icon: Calculator,
    title: "Maths step-by-step",
    body: "Every Mathematics answer comes with KNEC-style working, formulas and clear explanations.",
  },
  {
    icon: Target,
    title: "Smart difficulty",
    body: "Easy, medium or KCSE-difficult. The AI adapts language and depth to your learner level.",
  },
  {
    icon: ClipboardCheck,
    title: "Marking schemes",
    body: "Reveal answers and explanations after attempting — perfect for revision and teacher prep.",
  },
  {
    icon: Sparkles,
    title: "Curriculum aware",
    body: "Aligned with CBC/CBE competencies, KNEC examination standards and university formatting.",
  },
];

const subjects = [
  "Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics",
  "Geography", "History", "CRE/IRE", "Agriculture", "Computer Studies",
  "Business Studies", "University",
];

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-28 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
              CBC · CBE · KNEC · KCSE aligned
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Forge smarter <span className="text-gradient">study sessions</span> with AI
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              StudyForge turns any topic or paragraph into instant quizzes, revision questions and
              KNEC-style marking schemes — built for Kenyan students, teachers and tutors.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/generate"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-105 hover:shadow-glow"
              >
                <Zap className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Generate a quiz
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card/60 px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur transition-colors hover:bg-card"
              >
                See features
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              {subjects.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to revise — and to teach
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built around the way Kenyan classrooms actually work.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-glow">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-gradient-card p-8 shadow-soft sm:p-12">
          <div className="grid gap-10 lg:grid-cols-3">
            {[
              { n: "01", icon: BookOpen, t: "Choose a source", b: "Type a subject and topic, or paste your class notes / a passage." },
              { n: "02", icon: Brain, t: "Pick difficulty", b: "Easy, medium or KCSE-difficult. Choose MCQ, essay, structured or mixed." },
              { n: "03", icon: GraduationCap, t: "Revise & reveal", b: "Attempt the quiz, reveal marking-scheme answers and step-by-step working." },
            ].map((s) => (
              <div key={s.n}>
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl font-bold text-gradient">{s.n}</span>
                  <s.icon className="h-5 w-5 text-primary-glow" />
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center shadow-elegant sm:p-16">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to forge your next revision session?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Generate your first quiz in under 30 seconds — no signup required.
          </p>
          <Link
            to="/generate"
            className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-background px-7 py-3.5 text-base font-semibold text-primary shadow-soft transition-transform hover:scale-105"
          >
            <Zap className="h-4 w-4" /> Start generating
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
