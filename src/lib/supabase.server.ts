// Server-only Supabase helpers for TanStack server functions.
// Only import this module dynamically inside createServerFn handlers.
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { getRequestHeader } from "@tanstack/react-start/server";

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL is not configured");
  return url;
}

function anonKey(): string {
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error("SUPABASE_ANON_KEY is not configured");
  return key;
}

export function adminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(supabaseUrl(), serviceKey);
}

/** Validates the caller's Supabase JWT (attached by attachSupabaseAuth middleware). */
export async function requireSupabaseAuth(): Promise<{ user: User; authHeader: string }> {
  const authHeader = getRequestHeader("Authorization") ?? getRequestHeader("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No authorization header provided");
  }
  const sb = createClient(supabaseUrl(), anonKey(), {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data?.user) throw new Error("Unauthorized");
  return { user: data.user, authHeader };
}

/** Requires the caller to hold the admin role (server-side check via service role). */
export async function requireAdmin(): Promise<User> {
  const { user } = await requireSupabaseAuth();
  const admin = adminClient();
  const { data } = await admin
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Admin only");
  return user;
}