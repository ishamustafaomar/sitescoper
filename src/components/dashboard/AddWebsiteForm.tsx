import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface AddWebsiteFormProps {
  onAdd: (url: string) => Promise<void>;
}

export function AddWebsiteForm({ onAdd }: AddWebsiteFormProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setAdding(true);
    try {
      await onAdd(url.trim());
      setUrl("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-[var(--shadow-sm)]">
      <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-primary" />
        {t("dashboard.addForm.title")}
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="text"
          aria-label={t("dashboard.addForm.placeholder")}
          placeholder={t("dashboard.addForm.placeholder")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 font-body"
          disabled={adding}
        />
        <Button type="submit" variant="hero" disabled={adding || !url.trim()}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("dashboard.addForm.add")}
        </Button>
      </form>
    </div>
  );
}
