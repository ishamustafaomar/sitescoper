import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult } from "@/lib/api";

export function generateAnalysisPDF(
  analysis: AnalysisResult,
  url: string,
  scrapeData?: any
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(99, 91, 255); // primary purple
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

  // Overall score
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Overall Score", 20, 78);

  const scoreColor =
    analysis.overall_score >= 80
      ? [56, 161, 105]
      : analysis.overall_score >= 50
        ? [99, 91, 255]
        : [229, 62, 62];

  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(20, 82, 30, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${analysis.overall_score}`, 35, 93, { align: "center" });

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - 65);
  doc.text(summaryLines, 55, 87);

  // Page metadata
  let yPos = 110;
  if (scrapeData?.metadata) {
    const meta = scrapeData.metadata;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Page Information", 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    if (meta.title) {
      doc.text(`Title: ${meta.title}`, 20, yPos);
      yPos += 6;
    }
    if (meta.description) {
      const descLines = doc.splitTextToSize(`Description: ${meta.description}`, pageWidth - 40);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 5 + 4;
    }
    yPos += 4;
  }

  // Categories
  analysis.categories.forEach((category) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`${category.icon} ${category.name} — ${category.score}/100`, 20, yPos);
    yPos += 8;

    if (category.suggestions.length > 0) {
      const tableData = category.suggestions.map((s) => [
        s.priority.toUpperCase(),
        s.title,
        s.description,
        s.type.toUpperCase(),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Priority", "Issue", "Description", "Type"]],
        body: tableData,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
        headStyles: { fillColor: [99, 91, 255], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 18, fontStyle: "bold" },
          1: { cellWidth: 35 },
          2: { cellWidth: "auto" },
          3: { cellWidth: 18 },
        },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === "body") {
            const priority = String(data.cell.raw);
            if (priority === "HIGH") {
              data.cell.styles.textColor = [229, 62, 62];
            } else if (priority === "MEDIUM") {
              data.cell.styles.textColor = [99, 91, 255];
            } else {
              data.cell.styles.textColor = [56, 161, 105];
            }
          }
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `SiteScoper AI Report — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`sitescoper-report-${new URL(url).hostname}.pdf`);
}
