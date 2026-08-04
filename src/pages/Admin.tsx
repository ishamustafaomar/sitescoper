import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BarChart3, Globe, TrendingUp, Clock, Loader2,
  ChevronDown, ChevronUp, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/router-compat";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  totalWebsites: number;
  recentSignups: any[];
  onboardingResponses: any[];
  topReferrals: Record<string, number>;
  recentAnalyses: any[];
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  useEffect(() => {
    checkAdminAndLoad();
  }, [user]);

  const checkAdminAndLoad = async () => {
    if (!user) return;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roleData || roleData.length === 0) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    const [profilesRes, analysesRes, websitesRes, onboardingRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("analysis_history").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("websites").select("*"),
      supabase.from("onboarding_responses").select("*").order("created_at", { ascending: false }),
    ]);

    const onboardingData = (onboardingRes.data as any[]) || [];
    const referralCounts: Record<string, number> = {};
    onboardingData.forEach((r: any) => {
      const src = r.referral_source || "Unknown";
      referralCounts[src] = (referralCounts[src] || 0) + 1;
    });

    setStats({
      totalUsers: profilesRes.data?.length || 0,
      totalAnalyses: analysesRes.data?.length || 0,
      totalWebsites: websitesRes.data?.length || 0,
      recentSignups: (profilesRes.data || []).slice(0, 10),
      onboardingResponses: onboardingData,
      topReferrals: referralCounts,
      recentAnalyses: (analysesRes.data || []).slice(0, 20),
    });

    setLoading(false);
  };

  const toggle = (section: string) =>
    setExpandedSection((prev) => (prev === section ? null : section));

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="font-heading font-bold text-2xl mb-2">{t("admin.accessDenied")}</h2>
          <p className="text-muted-foreground font-body mb-6">{t("admin.noPrivileges")}</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> {t("admin.backDashboard")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-bold text-2xl">{t("admin.panel")}</h1>
          <Badge variant="secondary" className="text-xs">{t("admin.badge")}</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, label: t("admin.totalUsers"), value: stats?.totalUsers || 0, color: "text-primary" },
            { icon: BarChart3, label: t("admin.totalAnalyses"), value: stats?.totalAnalyses || 0, color: "text-accent" },
            { icon: Globe, label: t("admin.trackedWebsites"), value: stats?.totalWebsites || 0, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral Sources */}
        <Section
          title={t("admin.referralSources")}
          icon={TrendingUp}
          expanded={expandedSection === "referrals"}
          onToggle={() => toggle("referrals")}
        >
          {stats && Object.keys(stats.topReferrals).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.topReferrals)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                    <span className="text-sm font-body">{source}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary/20 w-24">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.topReferrals))) * 100}%`,
                          }}
                        />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{count}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm font-body p-4">{t("admin.noReferrals")}</p>
          )}
        </Section>

        {/* Onboarding Responses */}
        <Section
          title={t("admin.onboarding")}
          icon={Users}
          expanded={expandedSection === "onboarding"}
          onToggle={() => toggle("onboarding")}
        >
          {stats && stats.onboardingResponses.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.onboardingResponses.map((r: any) => (
                <div key={r.id} className="py-3 px-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-heading font-medium">{r.display_name || t("admin.anonymous")}</span>
                    <span className="text-[10px] text-muted-foreground font-body">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.role && <Badge variant="outline" className="text-[10px]">{r.role}</Badge>}
                    {r.company && <Badge variant="outline" className="text-[10px]">{r.company}</Badge>}
                    {r.experience_level && <Badge variant="secondary" className="text-[10px]">{r.experience_level}</Badge>}
                    {r.referral_source && <Badge className="text-[10px]">{r.referral_source}</Badge>}
                  </div>
                  {r.goals && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(r.goals as string[]).map((g: string) => (
                        <span key={g} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{g}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm font-body p-4">{t("admin.noOnboarding")}</p>
          )}
        </Section>

        {/* Recent Analyses */}
        <Section
          title={t("admin.recentAnalyses")}
          icon={Clock}
          expanded={expandedSection === "analyses"}
          onToggle={() => toggle("analyses")}
        >
          {stats && stats.recentAnalyses.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recentAnalyses.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-3 px-3">
                  <div className="min-w-0">
                    <p className="text-sm font-body truncate">{a.url}</p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={a.overall_score >= 80 ? "default" : a.overall_score >= 50 ? "secondary" : "destructive"} className="text-xs shrink-0">
                    {a.overall_score}/100
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm font-body p-4">{t("admin.noAnalyses")}</p>
          )}
        </Section>

        {/* Recent Users */}
        <Section
          title={t("admin.recentUsers")}
          icon={Users}
          expanded={expandedSection === "users"}
          onToggle={() => toggle("users")}
        >
          {stats && stats.recentSignups.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recentSignups.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-3 px-3">
                  <div>
                    <p className="text-sm font-heading font-medium">{u.display_name || t("admin.unnamed")}</p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {t("admin.joined", { date: new Date(u.created_at).toLocaleDateString() })}
                    </p>
                  </div>
                  <Badge variant={u.onboarding_completed ? "default" : "outline"} className="text-[10px]">
                    {u.onboarding_completed ? t("admin.onboarded") : t("admin.pending")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm font-body p-4">{t("admin.noUsers")}</p>
          )}
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: any;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-sm)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-heading font-semibold text-sm">{title}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
