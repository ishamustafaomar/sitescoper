import { useEffect, type ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";
import { CookieConsent } from "@/components/CookieConsent";
import NotFound from "@/pages/NotFound";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

// ported from main.tsx — i18n init (side-effect import)
import "@/i18n";

// ported from main.tsx — recover from stale chunk references after a redeploy:
// if a dynamic import fails (old HTML points at a chunk hash that no longer
// exists), reload once to fetch the new asset graph.
if (typeof window !== "undefined") {
  const RELOAD_KEY = "__chunk_reload__";
  const handleChunkError = (message: string) => {
    if (
      !/Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError/i.test(
        message,
      )
    )
      return;
    if (sessionStorage.getItem(RELOAD_KEY)) return;
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
  };
  window.addEventListener("error", (e) => handleChunkError(e.message || ""));
  window.addEventListener("unhandledrejection", (e) =>
    handleChunkError(String((e.reason as Error | undefined)?.message || e.reason || "")),
  );
  document.addEventListener("DOMContentLoaded", () => {
    // Clear the guard on a clean load so future stale-chunk events can retry.
    setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 5000);
  });
}

const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e6aaf4ed-72ae-4d3f-bb2f-341eb5731759";

// ported from index.html — JSON-LD structured data
const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "SiteScoper",
      url: "https://sitescoper.com/",
      logo: "https://sitescoper.com/favicon.png",
      sameAs: ["https://twitter.com/SiteScoper", "https://x.com/SiteScoper"],
    },
    {
      "@type": "WebSite",
      name: "SiteScoper — AI Website Analyzer",
      url: "https://sitescoper.com/",
      description:
        "Crawl any website and get AI-powered suggestions for UX, SEO, accessibility and design improvements.",
      publisher: { "@type": "Organization", name: "SiteScoper" },
    },
    {
      "@type": "SoftwareApplication",
      name: "SiteScoper",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "AI-powered website analyzer that crawls your site and gives you actionable UX, SEO, accessibility and design improvements.",
      url: "https://sitescoper.com/",
    },
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        name: "google-site-verification",
        content: "efmde7OOLbGZIuVPnO_yBB51yBtDthDJkhFaPo_9XjY",
      },
      { name: "author", content: "SiteScoper" },
      { name: "theme-color", content: "#0b0b0f" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SiteScoper" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@SiteScoper" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;500;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },

      { rel: "icon", href: "/favicon.png?v=6", type: "image/png", sizes: "any" },
      { rel: "apple-touch-icon", href: "/favicon.png?v=6" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "dns-prefetch", href: "https://tmdnoailedngafchtaxj.supabase.co" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON_LD }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Outlet />
              <CookieConsent />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-heading font-semibold">This page didn't load</h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a className="px-4 py-2 rounded-lg border border-border" href="/">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}