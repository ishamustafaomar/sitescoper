import { useId, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

export function CustomInstructions({ value, onChange, disabled, className, defaultOpen }: Props) {
  const { t } = useTranslation();
  const panelId = useId();
  const inputId = useId();
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
      <Button
        variant="ghost"
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="justify-start gap-1.5 px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {value.trim() ? t("customInstructions.toggle.added") : t("customInstructions.toggle.add")}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {open && (
        <div id={panelId} className="mt-2 border-l-2 border-border pl-4 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Button
                variant="outline"
                size="sm"
                key={p.label}
                type="button"
                disabled={disabled}
                onClick={() => togglePreset(p.value)}
                className="text-xs px-2.5"
              >
                + {p.label}
              </Button>
            ))}
          </div>
          <label htmlFor={inputId} className="sr-only">{t("customInstructions.textareaPlaceholder")}</label>
          <Textarea
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={t("customInstructions.textareaPlaceholder")}
            rows={3}
            maxLength={1000}
            className="text-sm font-body resize-none"
          />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-xs font-body text-muted-foreground">
            <span>{t("customInstructions.helperText")}</span>
            <span>{value.length}/1000</span>
          </div>
        </div>
      )}
    </div>
  );
}