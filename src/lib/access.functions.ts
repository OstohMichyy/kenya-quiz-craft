import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const FREE_QUOTA = 1;

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: sub }, { data: profile }, { data: roles }] = await Promise.all([
      supabase.from("subscriptions").select("status,started_at,expires_at").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("full_name,email,free_quota_used").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const now = Date.now();
    const isActive = !!(sub?.status === "active" && sub.expires_at && new Date(sub.expires_at).getTime() > now);
    const freeUsed = profile?.free_quota_used ?? 0;
    const freeRemaining = Math.max(0, FREE_QUOTA - freeUsed);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    return {
      isAuthenticated: true,
      isActive,
      isAdmin,
      freeRemaining,
      freeQuota: FREE_QUOTA,
      sub: sub ?? null,
      profile: profile ?? null,
    };
  });

export const submitPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      mpesa_code: z.string().trim().min(6).max(20).regex(/^[A-Z0-9]+$/i, "Code looks invalid"),
      phone: z.string().trim().max(20).optional().or(z.literal("")),
      amount: z.number().min(50).max(100000).default(100),
    }).parse(i),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("payment_submissions").insert({
      user_id: userId,
      mpesa_code: data.mpesa_code.toUpperCase(),
      phone: data.phone || null,
      amount: data.amount,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("payment_submissions").select("*").eq("user_id", userId)
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAdminPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Error("Forbidden");
    const { data, error } = await supabase
      .from("payment_submissions")
      .select("*, profiles!inner(full_name,email), subscriptions(status,expires_at)")
      .order("submitted_at", { ascending: false });
    if (error) {
      // fallback without join if RLS blocks
      const { data: d2, error: e2 } = await supabase
        .from("payment_submissions").select("*").order("submitted_at", { ascending: false });
      if (e2) throw new Error(e2.message);
      return d2 ?? [];
    }
    return data ?? [];
  });

export const approvePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), days: z.number().min(1).max(365).default(30) }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("approve_payment", { _payment_id: data.id, _days: data.days });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const rejectPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), notes: z.string().max(500).optional() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("reject_payment", { _payment_id: data.id, _notes: data.notes ?? null });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ title: z.string().min(1).max(200), payload: z.any() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("saved_quizzes").insert({ user_id: userId, title: data.title, payload: data.payload });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyQuizzes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("saved_quizzes").select("id,title,created_at").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("saved_quizzes").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
