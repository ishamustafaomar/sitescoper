import { useEffect, useState } from "react";
import { useSearchParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "loading" | "ready" | "already" | "invalid" | "done" | "error";

export default function Unsubscribe() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: ANON } }
        );
        const json = await res.json();
        if (json.valid) setState("ready");
        else if (json.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("loading");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    if (error) setState("error");
    else if (data?.success) setState("done");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-4 border rounded-2xl p-8">
        <h1 className="text-2xl font-semibold">{t("unsubscribe.title")}</h1>
        {state === "loading" && <p className="text-muted-foreground">{t("unsubscribe.checking")}</p>}
        {state === "ready" && (
          <>
            <p className="text-muted-foreground">{t("unsubscribe.confirmText")}</p>
            <Button onClick={confirm} className="w-full">{t("unsubscribe.confirmBtn")}</Button>
          </>
        )}
        {state === "done" && <p>{t("unsubscribe.done")}</p>}
        {state === "already" && <p>{t("unsubscribe.already")}</p>}
        {state === "invalid" && <p>{t("unsubscribe.invalid")}</p>}
        {state === "error" && <p>{t("unsubscribe.error")}</p>}
      </div>
    </main>
  );
}
