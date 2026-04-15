import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult } from "@/lib/api";
import { generateAnalysisPDF } from "@/lib/pdf";

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    const { data } = await supabase
      .from("analysis_history")
      .select("*")
      .eq("id", id)
      .single();

    if (data) setRecord(data);
    setLoading(false);
  };

  const handleExportPDF = () => {
    if (!record) return;
    const analysis: AnalysisResult = {
      overall_score: record.overall_score,
      summary: record.summary || "",
      categories: record.categories as any[],
    };
    generateAnalysisPDF(analysis, record.url, record.scrape_data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-body">Analysis not found.</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const analysis: AnalysisResult = {
    overall_score: record.overall_score,
    summary: record.summary || "",
    categories: record.categories as any[],
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="font-heading font-bold text-lg">{record.url}</h2>
              <p className="text-xs text-muted-foreground font-body">
                Analyzed {new Date(record.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AnalysisPanel analysis={analysis} />
        </motion.div>
      </main>
    </div>
  );
}
