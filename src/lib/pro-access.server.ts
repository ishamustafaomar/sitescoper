// Server-only: who counts as Pro (admin, active Fix Pass, or Pro subscription).
export async function requireProUser(message = "This is part of the Pro plan") {
  const { requireSupabaseAuth, adminClient, isAdminUser } = await import("@/lib/supabase.server");
  const { user } = await requireSupabaseAuth();
  const admin = adminClient();
  if (await isAdminUser(admin, user.id)) return { user, admin };
  const { data: passes } = await admin
    .from("fix_passes")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .limit(1);
  if ((passes ?? []).length > 0) return { user, admin };
  const { data: subs } = await admin
    .from("subscriptions")
    .select("status,current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const ok = (subs ?? []).some((s) => {
    const end = s.current_period_end ? new Date(s.current_period_end).getTime() : null;
    if (["active", "trialing", "past_due"].includes(s.status) && (end === null || end > Date.now())) return true;
    return s.status === "canceled" && !!end && end > Date.now();
  });
  if (!ok) throw new Error(message);
  return { user, admin };
}
