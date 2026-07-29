import { createFileRoute } from "@tanstack/react-router";
import AiWebsiteAuditTool from "@/pages/AiWebsiteAuditTool";

export const Route = createFileRoute("/ai-website-audit-tool")({
  component: AiWebsiteAuditTool,
});