import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PRESETS: { label: string; value: string }[] = [
  { label: "Conversion", value: "Focus on conversion rate: CTAs, friction, trust signals, and what would make a visitor sign up or buy." },
  { label: "SEO", value: "Focus on SEO: title, meta description, headings, internal linking, structured data, indexability, keyword targeting." },
  { label: "Accessibility", value: "Focus on accessibility: color contrast, alt text, semantic HTML, keyboard navigation, WCAG issues." },
  { label: "Mobile UX", value: "Focus on mobile experience: tap targets, viewport, performance, layout breakage, mobile-only friction." },
  { label: "Trust & credibility", value: "Focus on trust and credibility: social proof, testimonials, security signals, about/team, legal pages." },
  { label: "Copy & messaging", value: "Focus on copy and messaging: clarity of value prop, headlines, voice, persuasion, jargon." },
  { label: "Pricing clarity", value: "Focus on pricing and packaging: clarity, anchoring, plan structure, perceived value." },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

export function CustomInstructions({ value, onChange, disabled, className, defaultOpen }: Props) {
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
        {value.trim() ? "Custom focus added" : "Add custom focus (optional)"}
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
            placeholder="Tell the AI what to focus on most (e.g. 'I care about getting demo bookings — judge the homepage on that')."
            rows={3}
            maxLength={1000}
            className="text-sm font-body resize-none"
          />
          <div className="flex items-center justify-between text-[10px] font-body text-muted-foreground">
            <span>The AI will weight its analysis toward your focus.</span>
            <span>{value.length}/1000</span>
          </div>
        </div>
      )}
    </div>
  );
}