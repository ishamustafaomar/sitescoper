export type ConnectorCategory =
  | "reporting"
  | "collaboration"
  | "productivity"
  | "data"
  | "crm"
  | "builders"
  | "automation";

export type ConnectorDef = {
  id: string;
  name: string;
  /** i18n key suffix under connections.blurbs */
  blurb: string;
  category: ConnectorCategory;
  /** brand accent used for the tile */
  color: string;
  status: "soon" | "beta";
  popular?: boolean;
};

export const CONNECTOR_CATEGORIES: ConnectorCategory[] = [
  "reporting",
  "collaboration",
  "productivity",
  "data",
  "crm",
  "builders",
  "automation",
];

export const CONNECTORS: ConnectorDef[] = [
  { id: "google_sheets", name: "Google Sheets", blurb: "exportTo", category: "reporting", color: "#0F9D58", status: "soon", popular: true },
  { id: "google_slides", name: "Google Slides", blurb: "deck", category: "reporting", color: "#F4B400", status: "soon", popular: true },
  { id: "microsoft_powerpoint", name: "PowerPoint", blurb: "deck", category: "reporting", color: "#D24726", status: "soon" },
  { id: "microsoft_excel", name: "Excel", blurb: "exportTo", category: "reporting", color: "#217346", status: "soon" },
  { id: "google_docs", name: "Google Docs", blurb: "docs", category: "reporting", color: "#4285F4", status: "soon" },
  { id: "microsoft_word", name: "Word", blurb: "docs", category: "reporting", color: "#2B579A", status: "soon" },
  { id: "notion", name: "Notion", blurb: "docs", category: "reporting", color: "#111111", status: "soon", popular: true },

  { id: "slack", name: "Slack", blurb: "alerts", category: "collaboration", color: "#4A154B", status: "soon", popular: true },
  { id: "microsoft_teams", name: "Microsoft Teams", blurb: "alerts", category: "collaboration", color: "#5059C9", status: "soon" },
  { id: "linear", name: "Linear", blurb: "tasks", category: "collaboration", color: "#5E6AD2", status: "soon", popular: true },
  { id: "microsoft_sharepoint", name: "SharePoint", blurb: "storage", category: "collaboration", color: "#0078D4", status: "soon" },
  { id: "microsoft_onenote", name: "OneNote", blurb: "docs", category: "collaboration", color: "#7719AA", status: "soon" },

  { id: "google_drive", name: "Google Drive", blurb: "storage", category: "productivity", color: "#1A73E8", status: "soon" },
  { id: "microsoft_onedrive", name: "OneDrive", blurb: "storage", category: "productivity", color: "#0364B8", status: "soon" },
  { id: "google_mail", name: "Gmail", blurb: "email", category: "productivity", color: "#EA4335", status: "soon" },
  { id: "microsoft_outlook", name: "Outlook", blurb: "email", category: "productivity", color: "#0072C6", status: "soon" },
  { id: "google_calendar", name: "Google Calendar", blurb: "schedule", category: "productivity", color: "#4285F4", status: "soon" },

  { id: "bigquery", name: "BigQuery", blurb: "warehouse", category: "data", color: "#669DF6", status: "soon" },
  { id: "snowflake", name: "Snowflake", blurb: "warehouse", category: "data", color: "#29B5E8", status: "soon" },
  { id: "databricks", name: "Databricks", blurb: "warehouse", category: "data", color: "#FF3621", status: "soon" },
  { id: "fabric", name: "Microsoft Fabric", blurb: "warehouse", category: "data", color: "#0B6A0B", status: "soon" },

  { id: "hubspot", name: "HubSpot", blurb: "crm", category: "crm", color: "#FF7A59", status: "soon", popular: true },
  { id: "salesforce", name: "Salesforce", blurb: "crm", category: "crm", color: "#00A1E0", status: "soon" },

  { id: "claude", name: "Claude", blurb: "aiAssistant", category: "builders", color: "#D97757", status: "soon", popular: true },
  { id: "lovable", name: "Lovable", blurb: "builder", category: "builders", color: "#F24E1E", status: "soon", popular: true },
  { id: "base44", name: "Base44", blurb: "builder", category: "builders", color: "#1F6FEB", status: "soon" },
  { id: "bolt", name: "Bolt", blurb: "builder", category: "builders", color: "#1389FD", status: "soon" },
  { id: "v0", name: "v0", blurb: "builder", category: "builders", color: "#111111", status: "soon" },
  { id: "github", name: "GitHub", blurb: "repo", category: "builders", color: "#24292F", status: "soon" },
  { id: "webflow", name: "Webflow", blurb: "cms", category: "builders", color: "#146EF5", status: "soon" },
  { id: "framer", name: "Framer", blurb: "cms", category: "builders", color: "#0055FF", status: "soon" },
  { id: "wordpress", name: "WordPress", blurb: "cms", category: "builders", color: "#21759B", status: "soon" },
  { id: "shopify", name: "Shopify", blurb: "cms", category: "builders", color: "#95BF47", status: "soon" },
  { id: "vercel", name: "Vercel", blurb: "deploy", category: "builders", color: "#000000", status: "soon" },
  { id: "netlify", name: "Netlify", blurb: "deploy", category: "builders", color: "#00AD9F", status: "soon" },

  { id: "zapier", name: "Zapier", blurb: "automation", category: "automation", color: "#FF4F00", status: "soon" },
  { id: "make", name: "Make", blurb: "automation", category: "automation", color: "#6D00CC", status: "soon" },
  { id: "n8n", name: "n8n", blurb: "automation", category: "automation", color: "#EA4B71", status: "soon" },
  { id: "webhooks", name: "Webhooks", blurb: "automation", category: "automation", color: "#475569", status: "soon" },
  { id: "airtable", name: "Airtable", blurb: "exportTo", category: "data", color: "#FCB400", status: "soon" },
  { id: "google_analytics", name: "Google Analytics", blurb: "analytics", category: "data", color: "#E8710A", status: "soon" },
  { id: "google_search_console", name: "Search Console", blurb: "analytics", category: "data", color: "#4285F4", status: "soon", popular: true },
];
