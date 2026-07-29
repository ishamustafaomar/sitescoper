import { createFileRoute } from "@tanstack/react-router";
import WhiteLabelSeoReports from "@/pages/WhiteLabelSeoReports";

export const Route = createFileRoute("/white-label-seo-reports")({
  component: WhiteLabelSeoReports,
});