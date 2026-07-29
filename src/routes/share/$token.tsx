import { createFileRoute } from "@tanstack/react-router";
import SharedAnalysis from "@/pages/SharedAnalysis";

export const Route = createFileRoute("/share/$token")({
  component: SharedAnalysis,
});