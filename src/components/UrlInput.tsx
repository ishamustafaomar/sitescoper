import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
      <div className="flex flex-col sm:flex-row items-stretch gap-0 border border-foreground bg-card focus-within:shadow-[var(--shadow-md)] transition-shadow">
        <label htmlFor="scan-url" className="sr-only">
          {t("urlInput.placeholder")}
        </label>
        <Input
          id="scan-url"
          type="text"
          placeholder={t("urlInput.placeholder")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 h-14 px-4 text-base font-body"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="shrink-0 h-14 px-8 bg-primary text-primary-foreground font-body font-medium text-sm inline-flex items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l border-foreground hover:bg-foreground/85 disabled:opacity-40 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t("urlInput.analyze")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
