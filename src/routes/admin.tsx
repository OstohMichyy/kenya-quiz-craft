import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { useSession } from "@/lib/auth-hook";
import { getMyAccess, listAdminPayments, approvePayment, rejectPayment } from "@/lib/access.functions";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { AnimatedBackground } from "@/components/animated-bg";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — StudyForge" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchAccess = useServerFn(getMyAccess);
  const fetchPayments = useServerFn(listAdminPayments);
  const approve = useServerFn(approvePayment);
  const reject = useServerFn(rejectPayment);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const access = useQuery({ queryKey: ["access"], queryFn: () => fetchAccess(), enabled: !!user });
  const payments = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => fetchPayments(),
    enabled: !!user && access.data?.isAdmin === true,
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approve({ data: { id, days: 30 } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payments"] }),
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => reject({ data: { id, notes: "Rejected by admin" } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-payments"] }),
  });

  if (loading || !user || access.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>;
  }

  if (!access.data?.isAdmin) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground/><SiteHeader/>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive"/>
          <h1 className="mt-3 font-display text-2xl font-bold">Admin only</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account doesn't have admin access. Promote yourself in the database with:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-card p-3 text-left text-xs">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
          </pre>
        </div>
        <SiteFooter/>
      </div>
    );
  }

  const list = payments.data ?? [];
  const pending = list.filter((p) => p.status === "pending");
  const others = list.filter((p) => p.status !== "pending");

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground/><SiteHeader/>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Admin · Payments</h1>
        <p className="text-sm text-muted-foreground">Verify M-Pesa submissions and activate subscriptions.</p>

        <Section title={`Pending (${pending.length})`}>
          {pending.length === 0 ? <Empty text="No payments pending review."/> :
            pending.map((p) => (
              <Row key={p.id} p={p}>
                <button disabled={approveMut.isPending}
                  onClick={() => approveMut.mutate(p.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/25">
                  <CheckCircle2 className="h-3.5 w-3.5"/>Approve (30d)
                </button>
                <button disabled={rejectMut.isPending}
                  onClick={() => rejectMut.mutate(p.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/25">
                  <XCircle className="h-3.5 w-3.5"/>Reject
                </button>
              </Row>
            ))}
        </Section>

        <Section title={`History (${others.length})`}>
          {others.length === 0 ? <Empty text="No past payments."/> :
            others.map((p) => <Row key={p.id} p={p}/>)}
        </Section>
      </div>
      <SiteFooter/>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-border/60 bg-card/50 p-3 text-sm text-muted-foreground">{text}</p>;
}
type PaymentRow = {
  id: string; user_id: string; mpesa_code: string; amount: number; phone: string | null;
  status: string; submitted_at: string; admin_notes?: string | null;
};
function Row({ p, children }: { p: PaymentRow; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-gradient-card p-3 text-sm shadow-soft">
      <div className="flex flex-col">
        <span className="font-mono text-base font-semibold">{p.mpesa_code}</span>
        <span className="text-xs text-muted-foreground">KES {p.amount} · {p.phone || "no phone"} · {new Date(p.submitted_at).toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">User: <code className="text-foreground">{p.user_id.slice(0, 8)}…</code></span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
          p.status === "approved" ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600"
          : p.status === "rejected" ? "border-destructive/30 bg-destructive/15 text-destructive"
          : "border-amber-500/30 bg-amber-500/15 text-amber-600"
        }`}>{p.status}</span>
        {children}
      </div>
    </div>
  );
}
