import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { lazy, Suspense } from "react";
import { CookieConsent } from "@/components/CookieConsent";

// Lazy-load route components so simple pages (privacy / terms / auth) don't
// pull in the heavy app bundle (analysis panel, charts, AI chat, etc.).
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AnalysisDetail = lazy(() => import("./pages/AnalysisDetail"));
const SharedAnalysis = lazy(() => import("./pages/SharedAnalysis"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Admin = lazy(() => import("./pages/Admin"));
const Account = lazy(() => import("./pages/Account"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Compare = lazy(() => import("./pages/Compare"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CheckoutReturn = lazy(() => import("./pages/CheckoutReturn"));
const AiWebsiteAuditTool = lazy(() => import("./pages/AiWebsiteAuditTool"));
const WhiteLabelSeoReports = lazy(() => import("./pages/WhiteLabelSeoReports"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// Sensible defaults: cut redundant refetches and keep cached data warm.
// - staleTime: data is fresh for 60s, so re-mounting a component
//   that already has data won't trigger a network round-trip.
// - gcTime: keep unused query data in cache for 5 min so back/forward
//   nav stays instant.
// - refetchOnWindowFocus: disabled — most of our queries are user-owned
//   data that doesn't change while the tab is backgrounded. Subscription
//   state has its own focused refresh.
// - retry: 1 — fail fast instead of waiting through 3 exponential retries
//   for errors that won't recover (404, RLS denials, validation).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/share/:token" element={<SharedAnalysis />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route
                path="/compare"
                element={
                  <ProtectedRoute>
                    <Compare />
                  </ProtectedRoute>
                }
              />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/ai-website-audit-tool" element={<AiWebsiteAuditTool />} />
              <Route path="/white-label-seo-reports" element={<WhiteLabelSeoReports />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/checkout/return" element={<CheckoutReturn />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <OnboardingGuard>
                      <Dashboard />
                    </OnboardingGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analysis/:id"
                element={
                  <ProtectedRoute>
                    <AnalysisDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
