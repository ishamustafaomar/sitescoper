// Migrated from supabase/functions/delete-account (Deno edge function).
import { createServerFn } from "@tanstack/react-start";

export const deleteAccount = createServerFn({ method: "POST" }).handler(async () => {
  const { requireSupabaseAuth, adminClient } = await import("@/lib/supabase.server");

  const { user } = await requireSupabaseAuth();
  const admin = adminClient();

  // Delete app data first (RLS-safe with service role)
  await admin.from("analysis_history").delete().eq("user_id", user.id);
  await admin.from("websites").delete().eq("user_id", user.id);
  await admin.from("onboarding_responses").delete().eq("user_id", user.id);
  await admin.from("user_roles").delete().eq("user_id", user.id);
  await admin.from("profiles").delete().eq("user_id", user.id);

  // Finally remove the auth user
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) throw delErr;

  return { success: true };
});