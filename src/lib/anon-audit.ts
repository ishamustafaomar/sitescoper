import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "sitescoper_anon_session";
const USED_KEY = "sitescoper_anon_audit_used";

/** Stable id for this browser, used to allow exactly one free audit. */
export function getAnonSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id || id.length < 16) {
    id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`) +
      "-" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function hasUsedFreeAudit(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(USED_KEY) === "true";
}

export function markFreeAuditUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(USED_KEY, "true");
}

export function clearAnonAuditState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USED_KEY);
  localStorage.removeItem(SESSION_KEY);
}

/** Persist a guest audit for 24h so it can be attached to a new account. */
export async function saveAnonymousAudit(payload: {
  url: string;
  overall_score: number;
  summary?: string;
  categories: unknown;
  scrape_data?: unknown;
  custom_instructions?: string;
}): Promise<void> {
  try {
    await fetch("/api/public/save-anonymous-audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-anon-session": getAnonSessionId(),
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Failed to store free audit", e);
  }
}

/** After sign-up/sign-in, move any pending guest audit into the account. */
export async function claimAnonymousAudit(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return false;
  try {
    const { data, error } = await supabase.rpc("claim_anonymous_audit", {
      p_session_id: sessionId,
    });
    if (error) throw error;
    clearAnonAuditState();
    return Array.isArray(data) && data.length > 0;
  } catch (e) {
    console.error("Failed to attach free audit to account", e);
    return false;
  }
}
