import en from "@/i18n/locales/en.json";

type Dict = Record<string, any>;

function get(path: string): string {
  return path.split(".").reduce<Dict | string | undefined>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as Dict)[k] : undefined),
    en as Dict,
  ) as string ?? "";
}

/** FAQ pairs from the default (English) locale, for SSR JSON-LD. */
export function faqsFrom(prefix: string, count: number, style: "landing" | "page") {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const q = style === "landing" ? `${prefix}.q${n}` : `${prefix}.faq${n}q`;
    const a = style === "landing" ? `${prefix}.a${n}` : `${prefix}.faq${n}a`;
    return { q: get(q), a: get(a) };
  }).filter((f) => f.q && f.a);
}