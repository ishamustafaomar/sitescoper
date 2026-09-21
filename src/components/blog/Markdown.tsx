import type { ReactNode } from "react";
import { Link } from "@/lib/router-compat";

/**
 * Dependency-free markdown renderer for editorial content.
 * Supported: #### / ### / ## headings (with anchor ids), paragraphs, "- " and
 * "1. " lists, "> " quotes, pipe tables, fenced code, "---" rules, **bold**,
 * *italic*, `code`, and [text](url) links. Internal links render as router
 * links; external links open in a new tab.
 */

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export interface TocItem {
  id: string;
  text: string;
}

/** H2 headings, used for the table of contents. */
export function extractToc(body: string): TocItem[] {
  const out: TocItem[] = [];
  for (const line of body.split("\n")) {
    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      out.push({ id: slugifyHeading(text), text: stripInline(text) });
    }
  }
  return out;
}

export function wordCount(body: string): number {
  return body
    .replace(/[#>*`|\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function stripInline(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function renderInline(text: string): ReactNode[] {
  // Tokenise links first, then bold/italic/code inside plain segments.
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) parts.push(...renderEmphasis(text.slice(last, m.index), key++));
    const href = m[2];
    const label = m[1];
    const isExternal = /^https?:\/\//.test(href) && !href.startsWith("https://sitescoper.com");
    const internalHref = href.replace(/^https:\/\/sitescoper\.com/, "") || "/";
    parts.push(
      isExternal ? (
        <a key={`l${key++}`} href={href} className="text-primary underline underline-offset-4 hover:opacity-80" target="_blank" rel="noopener noreferrer">
          {renderEmphasis(label, 0)}
        </a>
      ) : (
        <Link key={`l${key++}`} to={internalHref} className="text-primary underline underline-offset-4 hover:opacity-80">
          {renderEmphasis(label, 0)}
        </Link>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(...renderEmphasis(text.slice(last), key++));
  return parts;
}

function renderEmphasis(text: string, key: number): ReactNode[] {
  const segs = text.split(/(\*\*[^*]+\*\*|`[^`]+`|(?<![*\w])\*[^*\n]+\*(?![*\w]))/g);
  return segs.filter(Boolean).map((s, i) => {
    const k = `${key}-${i}`;
    if (s.startsWith("**") && s.endsWith("**")) {
      return <strong key={k} className="font-semibold text-foreground">{s.slice(2, -2)}</strong>;
    }
    if (s.startsWith("`") && s.endsWith("`")) {
      return <code key={k} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{s.slice(1, -1)}</code>;
    }
    if (s.startsWith("*") && s.endsWith("*") && s.length > 2) {
      return <em key={k}>{s.slice(1, -1)}</em>;
    }
    return <span key={k}>{s}</span>;
  });
}

function renderTable(block: string, key: number): ReactNode {
  const rows = block
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.startsWith("|"))
    .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  if (rows.length < 2) return <p key={key}>{renderInline(block)}</p>;
  const header = rows[0]!;
  const body = rows.slice(1).filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
  return (
    <div key={key} className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left">
          <tr>
            {header.map((h, i) => (
              <th key={i} scope="col" className="px-3 py-2 font-heading font-semibold">{renderInline(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, i) => (
            <tr key={i} className="border-t border-border align-top">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-foreground/90">{renderInline(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function renderMarkdown(body: string): ReactNode[] {
  // Split into blocks but keep fenced code blocks intact.
  const blocks: string[] = [];
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  let buf: string[] = [];
  let inFence = false;
  const flush = () => {
    if (buf.length) {
      blocks.push(buf.join("\n"));
      buf = [];
    }
  };
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inFence) {
        buf.push(line);
        flush();
        inFence = false;
      } else {
        flush();
        inFence = true;
        buf.push(line);
      }
      continue;
    }
    if (inFence) {
      buf.push(line);
      continue;
    }
    if (line.trim() === "") {
      flush();
      continue;
    }
    buf.push(line);
  }
  flush();

  return blocks.map((raw, i) => {
    const block = raw.trim();
    if (block.startsWith("```")) {
      const code = block.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "");
      return (
        <pre key={i} className="my-6 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-[13px] leading-relaxed">
          <code className="font-mono">{code}</code>
        </pre>
      );
    }
    if (/^---+$/.test(block)) return <hr key={i} className="my-10 border-border" />;
    if (block.startsWith("#### ")) {
      const text = block.slice(5);
      return <h4 key={i} className="mt-6 mb-2 font-heading text-lg font-semibold">{renderInline(text)}</h4>;
    }
    if (block.startsWith("### ")) {
      const text = block.slice(4);
      return (
        <h3 key={i} id={slugifyHeading(text)} className="mt-8 mb-2 font-heading text-xl font-semibold scroll-mt-24">
          {renderInline(text)}
        </h3>
      );
    }
    if (block.startsWith("## ")) {
      const text = block.slice(3);
      return (
        <h2 key={i} id={slugifyHeading(text)} className="mt-12 mb-3 font-heading text-2xl font-semibold tracking-tight scroll-mt-24 md:text-3xl">
          {renderInline(text)}
        </h2>
      );
    }
    if (block.startsWith("# ")) {
      // Authors sometimes include an H1; the page already renders the title.
      const text = block.slice(2);
      return (
        <h2 key={i} id={slugifyHeading(text)} className="mt-12 mb-3 font-heading text-2xl font-semibold tracking-tight scroll-mt-24 md:text-3xl">
          {renderInline(text)}
        </h2>
      );
    }
    const blockLines = block.split("\n");
    if (blockLines.every((l) => l.startsWith("> "))) {
      return (
        <blockquote key={i} className="my-6 border-l-4 border-primary/60 pl-4 italic text-foreground/85">
          {renderInline(blockLines.map((l) => l.slice(2)).join(" "))}
        </blockquote>
      );
    }
    if (blockLines.every((l) => l.trim().startsWith("|"))) return renderTable(block, i);
    if (blockLines.every((l) => /^(\s*)[-*] /.test(l))) {
      return (
        <ul key={i} className="my-4 list-disc space-y-2 pl-6 text-foreground/90">
          {blockLines.map((l, j) => (
            <li key={j}>{renderInline(l.replace(/^\s*[-*] /, ""))}</li>
          ))}
        </ul>
      );
    }
    if (blockLines.every((l) => /^\s*\d+[.)] /.test(l))) {
      return (
        <ol key={i} className="my-4 list-decimal space-y-2 pl-6 text-foreground/90">
          {blockLines.map((l, j) => (
            <li key={j}>{renderInline(l.replace(/^\s*\d+[.)] /, ""))}</li>
          ))}
        </ol>
      );
    }
    // Mixed list (bullet lines with continuation) — treat each "- " line as an item.
    if (blockLines[0]?.startsWith("- ") && blockLines.filter((l) => l.startsWith("- ")).length > 1) {
      const items: string[] = [];
      for (const l of blockLines) {
        if (l.startsWith("- ")) items.push(l.slice(2));
        else if (items.length) items[items.length - 1] += " " + l.trim();
      }
      return (
        <ul key={i} className="my-4 list-disc space-y-2 pl-6 text-foreground/90">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="my-4 leading-relaxed text-foreground/90">
        {renderInline(blockLines.join(" "))}
      </p>
    );
  });
}

export function Markdown({ body }: { body: string }) {
  return <>{renderMarkdown(body)}</>;
}
