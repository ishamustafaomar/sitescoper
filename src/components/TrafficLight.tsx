import { cn } from "@/lib/utils";

export type TrafficLevel = "good" | "warn" | "bad" | "none";

export function getTrafficLevel(score: number | null | undefined): TrafficLevel {
  if (score == null) return "none";
  if (score >= 75) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

export function getTrafficLabel(level: TrafficLevel): string {
  switch (level) {
    case "good":
      return "Healthy";
    case "warn":
      return "Needs attention";
    case "bad":
      return "Critical";
    default:
      return "Not scanned";
  }
}

const STYLES: Record<TrafficLevel, { dot: string; chip: string; text: string; ring: string }> = {
  good: {
    dot: "bg-[hsl(var(--score-good))]",
    chip: "bg-[hsl(var(--score-good-bg))] text-[hsl(var(--score-good))] border-[hsl(var(--score-good))]/30",
    text: "text-[hsl(var(--score-good))]",
    ring: "ring-[hsl(var(--score-good))]/40",
  },
  warn: {
    dot: "bg-[hsl(var(--score-warn))]",
    chip: "bg-[hsl(var(--score-warn-bg))] text-[hsl(var(--score-warn))] border-[hsl(var(--score-warn))]/30",
    text: "text-[hsl(var(--score-warn))]",
    ring: "ring-[hsl(var(--score-warn))]/40",
  },
  bad: {
    dot: "bg-[hsl(var(--score-bad))]",
    chip: "bg-[hsl(var(--score-bad-bg))] text-[hsl(var(--score-bad))] border-[hsl(var(--score-bad))]/30",
    text: "text-[hsl(var(--score-bad))]",
    ring: "ring-[hsl(var(--score-bad))]/40",
  },
  none: {
    dot: "bg-muted-foreground/40",
    chip: "bg-muted text-muted-foreground border-border",
    text: "text-muted-foreground",
    ring: "ring-border",
  },
};

export function getTrafficStyles(level: TrafficLevel) {
  return STYLES[level];
}

interface TrafficDotProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const SIZE = { sm: "h-2 w-2", md: "h-2.5 w-2.5", lg: "h-3 w-3" };

export function TrafficDot({ score, size = "md", pulse = false, className }: TrafficDotProps) {
  const level = getTrafficLevel(score);
  const s = STYLES[level];
  return (
    <span
      className={cn(
        "inline-flex relative rounded-full",
        SIZE[size],
        s.dot,
        className
      )}
      aria-label={getTrafficLabel(level)}
    >
      {pulse && level !== "none" && (
        <span className={cn("absolute inset-0 rounded-full animate-ping opacity-50", s.dot)} />
      )}
    </span>
  );
}

interface TrafficChipProps {
  score: number | null | undefined;
  showScore?: boolean;
  className?: string;
}

export function TrafficChip({ score, showScore = true, className }: TrafficChipProps) {
  const level = getTrafficLevel(score);
  const s = STYLES[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-body font-medium",
        s.chip,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {showScore && score != null && <span className="font-heading font-bold">{score}</span>}
      {getTrafficLabel(level)}
    </span>
  );
}
