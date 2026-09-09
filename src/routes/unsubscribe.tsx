import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { pageHead } from "@/lib/seo-head";
import { Button } from "@/components/ui/button";

type State = "loading" | "confirm" | "already" | "invalid" | "success" | "error";

export const Route = createFileRoute("/unsubscribe")({
  head: () =>
    pageHead({
      path: "/unsubscribe",
      title: "Unsubscribe — SiteScoper",
      description: "Manage your SiteScoper email preferences.",
      noindex: true,
    }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const [state, setState] = useState<State>("loading");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (!t) {
      setState("invalid");
      return;
    }
    setToken(t);
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.valid) setState("confirm");
        else if (data.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, []);

  const confirm = async () => {
    if (!token) return;
    setState("loading");
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) setState("success");
      else if (data.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-3xl text-foreground">Email preferences</h1>
        {state === "loading" && (
          <div className="mt-6 flex justify-center" role="status" aria-label="Loading">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {state === "confirm" && (
          <>
            <p className="mt-4 text-muted-foreground">
              You're about to unsubscribe from SiteScoper emails. Sign-in and password emails will
              still work.
            </p>
            <Button className="mt-6" onClick={confirm}>
              Confirm unsubscribe
            </Button>
          </>
        )}
        {state === "success" && (
          <p className="mt-4 text-muted-foreground">
            Done — you won't receive these emails anymore.
          </p>
        )}
        {state === "already" && (
          <p className="mt-4 text-muted-foreground">This address is already unsubscribed.</p>
        )}
        {state === "invalid" && (
          <p className="mt-4 text-muted-foreground">
            This unsubscribe link is invalid or has expired.
          </p>
        )}
        {state === "error" && (
          <p className="mt-4 text-muted-foreground">
            Something went wrong. Please try again in a moment.
          </p>
        )}
      </div>
    </main>
  );
}
