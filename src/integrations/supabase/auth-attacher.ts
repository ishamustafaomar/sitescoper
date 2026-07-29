// Client-side function middleware: attaches the Supabase session token to
// every server-function RPC so server-side requireSupabaseAuth() can verify it.
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token ?? undefined;
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);