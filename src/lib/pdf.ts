import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult } from "@/lib/api";

// jsPDF's built-in helvetica is WinAnsi-only and renders unicode emojis as garbled glyphs
// (e.g. "🎯" becomes "Ø=ÜÊ"). Strip emojis & symbols before drawing any text.
const EMOJI_RE = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2000}-\u{27BF}\u{2B00}-\u{2BFF}\uFE0F\u200D]/gu;
function clean(s: string | undefined | null): string {
  if (!s) return "";
  return s.replace(EMOJI_RE, "").replace(/\s{2,}/g, " ").trim();
}

export function generateAnalysisPDF(
  analysis: AnalysisResult,
  url: string,
  scrapeData?: any
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(99, 91, 255);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SiteScoper Report", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated ${new Date().toLocaleDateString()}`, pageWidth - 20, 25, { align: "right" });

  // URL
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Website", 20, 55);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(url, 20, 62);

  if (analysis.site_category) {
    doc.setFontSize(9);
    doc.text(`Category: ${analysis.site_category}`, 20, 68);
  }

  // Overall score
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Overall Score", 20, 82);

  const scoreColor =
    analysis.overall_score >= 80
      ? [56, 161, 105]
      : analysis.overall_score >= 50
        ? [99, 91, 255]
        : [229, 62, 62];

  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(20, 86, 30, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${analysis.overall_score}`, 35, 97, { align: "center" });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(clean(analysis.summary) || "", pageWidth - 65);
  doc.text(summaryLines, 55, 91);

  let yPos = 110 + Math.max(0, (summaryLines.length - 3) * 4);

  const ensureSpace = (need: number) => {
    if (yPos > pageHeight - need) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Benchmark
  if (analysis.benchmark_label || analysis.benchmark_percentile !== undefined) {
    ensureSpace(30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Peer benchmark", 20, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    if (analysis.benchmark_percentile !== undefined) {
      doc.text(`Percentile vs peers: ${analysis.benchmark_percentile}%`, 20, yPos);
      yPos += 5;
    }
    if (analysis.benchmark_label) {
      const lines = doc.splitTextToSize(clean(analysis.benchmark_label), pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5;
    }
    if (analysis.peer_examples?.length) {
      doc.text(`Compare to: ${analysis.peer_examples.join(", ")}`, 20, yPos);
      yPos += 6;
    }
    yPos += 4;
  }

  // Action plan
  if (analysis.action_plan?.days?.length) {
    ensureSpace(40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("7-Day Action Plan", 20, yPos);
    yPos += 6;

    if (analysis.action_plan.headline) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      const lines = doc.splitTextToSize(clean(analysis.action_plan.headline), pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 2;
    }

    autoTable(doc, {
      startY: yPos,
      head: [["Day", "Title", "Task", "Time"]],
      body: analysis.action_plan.days.map((d) => [
        `Day ${d.day}`,
        clean(d.title),
        clean(d.task),
        `${d.estimated_minutes ?? 30}m`,
      ]),
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
      headStyles: { fillColor: [99, 91, 255], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: "bold" },
        1: { cellWidth: 40 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 14 },
      },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Page metadata
  if (scrapeData?.metadata) {
    const meta = scrapeData.metadata;
    ensureSpace(30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Page Information", 20, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    if (meta.title) {
      doc.text(`Title: ${clean(meta.title)}`, 20, yPos);
      yPos += 5;
    }
    if (meta.description) {
      const descLines = doc.splitTextToSize(`Description: ${clean(meta.description)}`, pageWidth - 40);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 5 + 2;
    }
    yPos += 4;
  }

  // Categories
  analysis.categories.forEach((category) => {
    ensureSpace(30);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`${clean(category.name)} - ${category.score}/100`, 20, yPos);
    yPos += 6;

    if (category.sub_scores?.length) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      const subText = category.sub_scores.map((s) => `${clean(s.name)}: ${s.score}`).join("  |  ");
      const subLines = doc.splitTextToSize(subText, pageWidth - 40);
      doc.text(subLines, 20, yPos);
      yPos += subLines.length * 4 + 2;
    }

    if (category.suggestions.length > 0) {
      const tableData = category.suggestions.map((s) => [
        s.priority.toUpperCase(),
        clean(s.title),
        clean(s.description) + (s.evidence ? `\n\nEvidence: "${clean(s.evidence)}"` : "") +
          (s.rewrite ? `\n\nBefore: ${clean(s.rewrite.before)}\nAfter: ${clean(s.rewrite.after)}` : ""),
        `${s.impact ?? "med"}/${s.effort ?? "med"}`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Priority", "Issue", "Detail", "Imp/Eff"]],
        body: tableData,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
        headStyles: { fillColor: [99, 91, 255], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 16, fontStyle: "bold" },
          1: { cellWidth: 32 },
          2: { cellWidth: "auto" },
          3: { cellWidth: 18 },
        },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === "body") {
            const priority = String(data.cell.raw);
            if (priority === "HIGH") data.cell.styles.textColor = [229, 62, 62];
            else if (priority === "MEDIUM") data.cell.styles.textColor = [99, 91, 255];
            else data.cell.styles.textColor = [56, 161, 105];
          }
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
  });

  // Image suggestions
  if (analysis.image_suggestions?.length) {
    ensureSpace(30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Image Alt-Text Suggestions", 20, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [["Image", "Current Alt", "Suggested Alt", "Issue"]],
      body: analysis.image_suggestions.map((img) => [
        img.src.length > 40 ? img.src.slice(0, 40) + "..." : img.src,
        clean(img.current_alt) || "(empty)",
        clean(img.suggested_alt),
        clean(img.issue),
      ]),
      margin: { left: 20, right: 20 },
      styles: { fontSize: 7, cellPadding: 2, font: "helvetica" },
      headStyles: { fillColor: [99, 91, 255], textColor: [255, 255, 255] },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `SiteScoper AI Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  doc.save(`sitescoper-report-${new URL(url).hostname}.pdf`);
}
