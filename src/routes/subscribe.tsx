import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, ShieldCheck, Smartphone, XCircle } from "lucide-react";
import { useSession } from "@/lib/auth-hook";
import { getMyAccess, submitPayment, listMyPayments } from "@/lib/access.functions";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { AnimatedBackground } from "@/components/animated-bg";

export const Route = createFileRoute("/subscribe")({
  head: () => ({
    meta: [
      { title: "Subscribe — StudyForge" },
      { name: "description", content: "Subscribe for KES 100/month and unlock unlimited AI quiz generation." },
    ],
  }),
  component: SubscribePage,
});

// 💡 Edit these to match your real M-Pesa account
const PAY_INSTRUCTIONS = {
  type: "Till", // or "PayBill"
  number: "XXXXXX",
  accountName: "StudyForge",
  amount: 100,
};

function SubscribePage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchAccess = useServerFn(getMyAccess);
  const fetchPayments = useServerFn(listMyPayments);
  const submit = useServerFn(submitPayment);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const access = useQuery({ queryKey: ["access"], queryFn: () => fetchAccess(), enabled: !!user });
  const payments = useQuery({ queryKey: ["my-payments"], queryFn: () => fetchPayments(), enabled: !!user });

  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: async () => submit({ data: { mpesa_code: code.trim(), phone: phone.trim(), amount: PAY_INSTRUCTIONS.amount } }),
    onSuccess: () => {
      setCode(""); setPhone(""); setErr(null);
      qc.invalidateQueries({ queryKey: ["my-payments"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  if (loading || !user) return <FullPageLoader />;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Subscribe to StudyForge</h1>
        <p className="mt-1 text-muted-foreground">KES 100 / month · 30 days of unlimited AI quizzes</p>

        {access.data?.isActive && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500"/>
            <div>
              <p className="font-semibold">Your subscription is active.</p>
              <p className="text-muted-foreground">Expires {new Date(access.data.sub!.expires_at!).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Step 1 */}
          <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><Smartphone className="h-4 w-4 text-primary"/>1. Pay via M-Pesa</div>
            <ul className="space-y-2 text-sm">
              <li>• Go to <b>M-Pesa → Lipa na M-Pesa → {PAY_INSTRUCTIONS.type}</b></li>
              <li>• Enter <b>{PAY_INSTRUCTIONS.type} number: {PAY_INSTRUCTIONS.number}</b> ({PAY_INSTRUCTIONS.accountName})</li>
              <li>• Amount: <b>KES {PAY_INSTRUCTIONS.amount}</b></li>
              <li>• Complete the payment and copy the M-Pesa transaction code (e.g. <code>SLI3AB7CD9</code>)</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1">
              <ShieldCheck className="h-3.5 w-3.5 mt-0.5"/> Admin verifies within 24h. You'll get 30 days of access from approval.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-primary"/>2. Submit your code</div>
            <form onSubmit={(e) => { e.preventDefault(); mutate.mutate(); }} className="space-y-3">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="M-Pesa transaction code"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                required minLength={6} maxLength={20} pattern="[A-Z0-9]+" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              {err && <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{err}</p>}
              <button disabled={mutate.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-hero px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow disabled:opacity-60">
                {mutate.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
                Submit for verification
              </button>
              {mutate.isSuccess && <p className="text-xs text-emerald-500">Submitted. Admin will verify shortly.</p>}
            </form>
          </div>
        </div>

        <h2 className="mt-10 font-display text-lg font-semibold">Your payment history</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-border/60">
          {(payments.data ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="p-3">Code</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Submitted</th></tr>
              </thead>
              <tbody>
                {payments.data!.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3 font-mono">{p.mpesa_code}</td>
                    <td className="p-3">KES {p.amount}</td>
                    <td className="p-3"><StatusPill status={p.status}/></td>
                    <td className="p-3 text-muted-foreground">{new Date(p.submitted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Link to="/dashboard" className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to dashboard</Link>
      </div>
      <SiteFooter />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { c: string; icon: typeof Clock }> = {
    pending: { c: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: Clock },
    approved: { c: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
    rejected: { c: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle },
  };
  const m = map[status] ?? map.pending;
  const Icon = m.icon;
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${m.c}`}><Icon className="h-3 w-3"/>{status}</span>;
}

function FullPageLoader() {
  return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>;
}
