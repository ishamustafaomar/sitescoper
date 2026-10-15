import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let normalized = url.trim();
    if (!normalized.startsWith("http")) normalized = "https://" + normalized;
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-stretch border border-foreground bg-card focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow">
        <label htmlFor="scan-url" className="sr-only">
          {t("urlInput.placeholder")}
        </label>
        <Input
          id="scan-url"
          type="text"
          autoComplete="url"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t("urlInput.placeholder")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 h-14 px-4 text-base font-body"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
          aria-label={isLoading ? t("urlInput.analyzing") : t("urlInput.analyze")}
          aria-busy={isLoading}
           className="shrink-0 min-h-14 rounded-none px-6 border-t sm:border-t-0 sm:border-l border-foreground disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="sr-only">{t("urlInput.analyzing")}</span>
            </>
          ) : (
            <>
              {t("urlInput.analyze")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
