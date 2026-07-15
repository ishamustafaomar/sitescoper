import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

export function CustomInstructions({ value, onChange, disabled, className, defaultOpen }: Props) {
  const { t } = useTranslation();
  const PRESETS: { label: string; value: string }[] = [
    { label: t("customInstructions.presets.conversion"), value: t("customInstructions.presets.conversionValue") },
    { label: t("customInstructions.presets.seo"), value: t("customInstructions.presets.seoValue") },
    { label: t("customInstructions.presets.accessibility"), value: t("customInstructions.presets.accessibilityValue") },
    { label: t("customInstructions.presets.mobileUx"), value: t("customInstructions.presets.mobileUxValue") },
    { label: t("customInstructions.presets.trust"), value: t("customInstructions.presets.trustValue") },
    { label: t("customInstructions.presets.copy"), value: t("customInstructions.presets.copyValue") },
    { label: t("customInstructions.presets.pricing"), value: t("customInstructions.presets.pricingValue") },
  ];
  const [open, setOpen] = useState<boolean>(defaultOpen ?? !!value);

  const togglePreset = (preset: string) => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) onChange(preset);
    else if (!trimmed.includes(preset)) onChange(trimmed + "\n" + preset);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {value.trim() ? t("customInstructions.toggle.added") : t("customInstructions.toggle.add")}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 space-y-3 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                disabled={disabled}
                onClick={() => togglePreset(p.value)}
                className="text-[11px] font-body px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted hover:border-primary/40 transition-colors disabled:opacity-50"
              >
                + {p.label}
              </button>
            ))}
          </div>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={t("customInstructions.textareaPlaceholder")}
            rows={3}
            maxLength={1000}
            className="text-sm font-body resize-none"
          />
          <div className="flex items-center justify-between text-[10px] font-body text-muted-foreground">
            <span>{t("customInstructions.helperText")}</span>
            <span>{value.length}/1000</span>
          </div>
        </div>
      )}
    </div>
  );
}