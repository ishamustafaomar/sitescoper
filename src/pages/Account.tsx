import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Download, Trash2, Loader2, Shield, User as UserIcon, Globe } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function Account() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [profile, onboarding, websites, history] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id),
        supabase.from("onboarding_responses").select("*").eq("user_id", user.id),
        supabase.from("websites").select("*").eq("user_id", user.id),
        supabase.from("analysis_history").select("*").eq("user_id", user.id),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        account: { id: user.id, email: user.email, created_at: user.created_at },
        profile: profile.data,
        onboarding_responses: onboarding.data,
        websites: websites.data,
        analysis_history: history.data,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sitescoper-data-${user.id.slice(0, 8)}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: t("account.exported") });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { deleteAccount } = await import("@/lib/delete-account.functions");
      await deleteAccount();
      toast({ title: t("account.deleted"), description: t("account.deletedDesc") });
      await signOut();
      navigate("/", { replace: true });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <header className="space-y-1">
            <h1 className="text-3xl font-heading font-bold">{t("account.title")}</h1>
            <p className="text-sm text-muted-foreground font-body">{t("account.subtitle")}</p>
          </header>

          {/* Profile */}
          <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-heading font-semibold flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              {t("account.profile")}
            </h2>
            <div className="text-sm font-body">
              <span className="text-muted-foreground">{t("account.email")}:</span>{" "}
              <span className="font-medium">{user.email}</span>
            </div>
          </section>

          {/* Language */}
          <section className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {t("account.language")}
              </h2>
            </div>
            <LanguageSwitcher />
          </section>

          {/* Plan & billing */}
          <SubscriptionCard />

          {/* GDPR */}
          <section className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <h2 className="font-heading font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {t("account.dataTitle")}
            </h2>

            <div className="space-y-2">
              <h3 className="font-heading font-medium text-sm">{t("account.exportTitle")}</h3>
              <p className="text-sm text-muted-foreground font-body">{t("account.exportDesc")}</p>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                {t("account.exportBtn")}
              </Button>
            </div>

            <div className="border-t border-border pt-6 space-y-2">
              <h3 className="font-heading font-medium text-sm text-destructive">{t("account.deleteTitle")}</h3>
              <p className="text-sm text-muted-foreground font-body">{t("account.deleteDesc")}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("account.deleteBtn")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("account.confirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("account.confirmDesc")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={t("account.confirmPlaceholder")}
                    className="font-body"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>{t("account.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={confirmText !== "DELETE" || deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      {t("account.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}