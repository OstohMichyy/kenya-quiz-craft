import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { CheckCircle2, Clock, Loader2, Sparkles, Crown, BookOpen, ShieldAlert } from "lucide-react";
import { useSession } from "@/lib/auth-hook";
import { getMyAccess, listMyQuizzes } from "@/lib/access.functions";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { AnimatedBackground } from "@/components/animated-bg";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — StudyForge" }] }),
  component: DashPage,
});

function DashPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const fetchAccess = useServerFn(getMyAccess);
  const fetchQuizzes = useServerFn(listMyQuizzes);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const access = useQuery({ queryKey: ["access"], queryFn: () => fetchAccess(), enabled: !!user });
  const quizzes = useQuery({ queryKey: ["my-quizzes"], queryFn: () => fetchQuizzes(), enabled: !!user });

  if (loading || !user || access.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>;
  }

  const a = access.data!;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Hi, {a.profile?.full_name || user.email}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {a.isAdmin && (
            <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <ShieldAlert className="h-3.5 w-3.5"/>Admin
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatusCard access={a} />
          <div className="rounded-xl border border-border/60 bg-gradient-card p-4 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><Sparkles className="h-3.5 w-3.5"/>Free trial</div>
            <p className="mt-2 text-2xl font-bold">{a.freeRemaining} / {a.freeQuota}</p>
            <p className="text-xs text-muted-foreground">quizzes remaining</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-gradient-card p-4 shadow-soft">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><BookOpen className="h-3.5 w-3.5"/>Saved</div>
            <p className="mt-2 text-2xl font-bold">{quizzes.data?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">saved quizzes</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/generate" className="inline-flex items-center gap-2 rounded-lg bg-gradient-hero px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
            <Sparkles className="h-4 w-4"/>Generate a quiz
          </Link>
          {!a.isActive && (
            <Link to="/subscribe" className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary">
              <Crown className="h-4 w-4"/>Subscribe — KES 100/mo
            </Link>
          )}
        </div>

        <h2 className="mt-10 font-display text-lg font-semibold">Recent saved quizzes</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-border/60">
          {(quizzes.data ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">You haven't saved any quizzes yet. Generate one and click <b>Save</b>.</p>
          ) : (
            <ul className="divide-y divide-border">
              {quizzes.data!.map((q) => (
                <li key={q.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="font-medium">{q.title}</span>
                  <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function StatusCard({ access: a }: { access: Awaited<ReturnType<typeof getMyAccess>> }) {
  if (a.isActive) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5"/>Active</div>
        <p className="mt-2 text-lg font-semibold">Premium</p>
        <p className="text-xs text-muted-foreground">Expires {new Date(a.sub!.expires_at!).toLocaleDateString()}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-600"><Clock className="h-3.5 w-3.5"/>Inactive</div>
      <p className="mt-2 text-lg font-semibold">Free tier</p>
      <p className="text-xs text-muted-foreground">Subscribe for unlimited access</p>
    </div>
  );
}

// Re-export for type usage in non-route helpers
import type {} from "@/lib/access.functions";
