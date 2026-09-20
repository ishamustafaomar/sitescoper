import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listFixPasses } from "@/lib/fix-pass.functions";

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** True when the signed-in user holds an active Audit & Fix Pass for this address. */
export function useFixPass(url?: string) {
  const { user } = useAuth();
  const [hasPass, setHasPass] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user || !url) {
      setHasPass(false);
      return;
    }
    listFixPasses()
      .then((passes) => {
        if (!cancelled) setHasPass(passes.some((p) => hostOf(p.url) === hostOf(url)));
      })
      .catch(() => {
        if (!cancelled) setHasPass(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, url]);

  return { hasPass: !!hasPass, loading: hasPass === null };
}
